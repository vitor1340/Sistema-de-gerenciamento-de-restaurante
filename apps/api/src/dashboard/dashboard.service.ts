import { Injectable } from '@nestjs/common';
import { CanalVenda, StatusPedido } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  addDays,
  dataCabecalhoFormatada,
  diaSemanaAbreviado,
  endOfDay,
  saudacaoPorHorario,
  startOfDay,
  variacaoPercentual,
} from '../common/date.util';

const CANAIS_ORDENADOS: CanalVenda[] = [
  CanalVenda.CARDAPIO_DIGITAL,
  CanalVenda.WHATSAPP,
  CanalVenda.QR_CODE_SALAO,
];

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async totaisDoDia(restauranteId: string, dia: Date) {
    const where = {
      restauranteId,
      status: { not: StatusPedido.CANCELADO },
      createdAt: { gte: startOfDay(dia), lte: endOfDay(dia) },
    };

    const [agregado, tempoMedio] = await Promise.all([
      this.prisma.pedido.aggregate({
        where,
        _sum: { valorTotalCentavos: true },
        _count: { _all: true },
      }),
      this.prisma.pedido.aggregate({
        where: { ...where, tempoPreparoMinutos: { not: null } },
        _avg: { tempoPreparoMinutos: true },
      }),
    ]);

    return {
      totalCentavos: agregado._sum.valorTotalCentavos ?? 0,
      quantidade: agregado._count._all,
      tempoMedioMinutos: Math.round(tempoMedio._avg.tempoPreparoMinutos ?? 0),
    };
  }

  async summary(restauranteId: string, userId: string) {
    const agora = new Date();
    const hoje = startOfDay(agora);
    const ontem = addDays(hoje, -1);

    const [hojeStats, ontemStats, ultimoPedidoNovo, usuario] =
      await Promise.all([
        this.totaisDoDia(restauranteId, hoje),
        this.totaisDoDia(restauranteId, ontem),
        this.prisma.pedido.findFirst({
          where: { restauranteId, status: StatusPedido.NOVO },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.usuario.findUniqueOrThrow({ where: { id: userId } }),
      ]);

    const ticketMedioHoje =
      hojeStats.quantidade > 0
        ? hojeStats.totalCentavos / hojeStats.quantidade
        : 0;
    const ticketMedioOntem =
      ontemStats.quantidade > 0
        ? ontemStats.totalCentavos / ontemStats.quantidade
        : 0;

    return {
      dataFormatada: dataCabecalhoFormatada(agora),
      saudacao: `${saudacaoPorHorario(agora)}, ${usuario.nome}!`,
      vendasHoje: {
        valorCentavos: hojeStats.totalCentavos,
        variacaoPercentual: variacaoPercentual(
          hojeStats.totalCentavos,
          ontemStats.totalCentavos,
        ),
      },
      pedidosHoje: {
        quantidade: hojeStats.quantidade,
        variacaoAbsoluta: hojeStats.quantidade - ontemStats.quantidade,
      },
      ticketMedio: {
        valorCentavos: Math.round(ticketMedioHoje),
        variacaoPercentual: variacaoPercentual(
          ticketMedioHoje,
          ticketMedioOntem,
        ),
      },
      tempoMedioPreparo: {
        minutos: hojeStats.tempoMedioMinutos,
        variacaoMinutos:
          hojeStats.tempoMedioMinutos - ontemStats.tempoMedioMinutos,
      },
      ultimoPedidoNovo: ultimoPedidoNovo
        ? {
            numero: ultimoPedidoNovo.numero,
            clienteNome: ultimoPedidoNovo.clienteNome,
            valorTotalCentavos: ultimoPedidoNovo.valorTotalCentavos,
          }
        : null,
    };
  }

  async salesPerformance(restauranteId: string, dias: number) {
    const hoje = startOfDay(new Date());
    const inicioPeriodo = addDays(hoje, -(dias - 1));
    const inicioPeriodoAnterior = addDays(inicioPeriodo, -dias);
    const fimPeriodoAnterior = addDays(inicioPeriodo, -1);

    const serie: { data: string; diaSemana: string; valorCentavos: number }[] =
      [];
    for (let i = 0; i < dias; i++) {
      const dia = addDays(inicioPeriodo, i);
      const { totalCentavos } = await this.totaisDoDia(restauranteId, dia);
      serie.push({
        data: dia.toISOString().slice(0, 10),
        diaSemana: diaSemanaAbreviado(dia),
        valorCentavos: totalCentavos,
      });
    }

    const totalPeriodo = serie.reduce(
      (acc, item) => acc + item.valorCentavos,
      0,
    );

    const agregadoAnterior = await this.prisma.pedido.aggregate({
      where: {
        restauranteId,
        status: { not: StatusPedido.CANCELADO },
        createdAt: {
          gte: inicioPeriodoAnterior,
          lte: endOfDay(fimPeriodoAnterior),
        },
      },
      _sum: { valorTotalCentavos: true },
    });
    const totalPeriodoAnterior = agregadoAnterior._sum.valorTotalCentavos ?? 0;

    return {
      totalPeriodoCentavos: totalPeriodo,
      variacaoPercentual: variacaoPercentual(
        totalPeriodo,
        totalPeriodoAnterior,
      ),
      serie,
    };
  }

  async salesChannels(restauranteId: string) {
    const hoje = startOfDay(new Date());

    const grupos = await this.prisma.pedido.groupBy({
      by: ['canal'],
      where: {
        restauranteId,
        status: { not: StatusPedido.CANCELADO },
        createdAt: { gte: hoje, lte: endOfDay(hoje) },
      },
      _count: { _all: true },
    });

    const totalPedidos = grupos.reduce(
      (acc, grupo) => acc + grupo._count._all,
      0,
    );
    const contagemPorCanal = new Map(
      grupos.map((g) => [g.canal, g._count._all]),
    );

    const canais = CANAIS_ORDENADOS.map((canal) => {
      const quantidade = contagemPorCanal.get(canal) ?? 0;
      return {
        canal,
        quantidade,
        percentual:
          totalPedidos > 0 ? Math.round((quantidade / totalPedidos) * 100) : 0,
      };
    });

    return { totalPedidos, canais };
  }
}

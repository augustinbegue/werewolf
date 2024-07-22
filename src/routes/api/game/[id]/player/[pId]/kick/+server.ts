import { prisma } from "$lib/server/db";
import { error, json, type RequestHandler } from "@sveltejs/kit";

export const POST: RequestHandler = async ({ params, cookies }) => {
  const me = await prisma.player.findUnique({
    where: {
      id: cookies.get("token")
    }
  });

  if (!me?.owner) {
    throw error(403, "You are not the owner of this game");
  }

  const game = await prisma.game.findUnique({
    where: {
      id: params.id
    },
    include: {
      players: true
    }
  });

  if (!game) {
    throw error(404, "Game not found");
  }

  const player = await prisma.player.delete({
    where: {
      id: params.pId
    }
  });

  console.log(`Player ${player.name} kicked`);

  if (player.roleId) {
    await prisma.role.update({
      where: {
        id: player.roleId
      },
      data: {
        count: {
          decrement: 1
        }
      }
    });
  }

  return json({ success: true });
}

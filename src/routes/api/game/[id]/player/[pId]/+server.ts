import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { prisma } from "$lib/server/db";

export const PATCH: RequestHandler = async ({ params, request, cookies }) => {
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

  const player = await prisma.player.update({
    where: {
      id: params.pId
    },
    data: {
      ...await request.json()
    }
  });

  console.log(`Player ${player.name} updated`);

  return json({ success: true });
}

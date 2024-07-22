import { error, redirect } from "@sveltejs/kit";
import { prisma } from "$lib/server/db";
import type { Actions } from "./$types.js";
import { createPlayer } from "$lib/server/player.js";

export const load = async ({ params, request, cookies }) => {
  const game = await prisma.game.findUnique({
    where: {
      id: params.id
    },
    include: {
      roles: true,
      players: true
    }
  });

  if (!game) {
    throw error(404, "Game not found");
  }

  const playerCount = game.players.filter((player) => !player.owner).length;

  if (game.players.some((player) => player.id === cookies.get("token"))) {
    if (game.nbPlayers === playerCount) {
      throw redirect(303, `/game/${params.id}/play`);
    }

    throw redirect(303, `/game/${params.id}`);
  }

  if (game.nbPlayers === playerCount) {
    throw error(403, "Game is full");
  }
};

export const actions: Actions = {
  default: async ({ request, params, cookies }) => {
    const data = await request.formData();
    const player = await createPlayer(params.id, data.get("name")?.toString() ?? "Player");

    cookies.set("token", player.id, { path: "/", secure: false });

    return { player };
  }
}

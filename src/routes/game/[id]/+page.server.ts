import { prisma } from "$lib/server/db";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, params, cookies }) => {
  if (cookies.get("token") === undefined) {
    throw redirect(303, url.pathname + "/join");
  }

  const token = cookies.get("token");

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

  if (!game.players.some((player) => player.id === token)) {
    cookies.set("token", "", { path: "/", secure: false });
    throw redirect(303, url.pathname + "/join");
  }

  const playerCount = game.players.filter((player) => !player.owner).length;
  if (game.nbPlayers === playerCount) {
    throw redirect(303, `/game/${params.id}/play`);
  }

  return {
    ...game,
    me: token
  };
}

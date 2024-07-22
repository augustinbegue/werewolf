import { prisma } from "$lib/server/db";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url, params, cookies }) => {
  if (cookies.get("token") === undefined) {
    throw redirect(303, `/game/${params.id}/join`);
  }

  const token = cookies.get("token");
  const me = await prisma.player.findUnique({
    where: {
      id: token
    }
  });

  const game = await prisma.game.findUnique({
    where: {
      id: params.id
    },
    include: {
      roles: true,
      players: me?.owner ? {
        where: {
          owner: false
        }
      } : undefined
    }
  });

  if (!game) {
    throw error(404, "Game not found");
  }

  if (!me?.owner && !game.players.some((player) => player.id === token)) {
    cookies.set("token", "", { path: "/", secure: false });
    throw redirect(303, `/game/${params.id}/join`);
  }

  // if (game.players.filter((player) => !player.owner).length !== game.nbPlayers) {
  //   throw redirect(303, `/game/${params.id}`);
  // }

  return {
    ...game,
    me
  };
}

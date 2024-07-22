import { prisma } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { selectRandomElement } from "$lib/utils";

export const POST: RequestHandler = async ({ params, cookies }) => {
  const { id } = params;
  const token = cookies.get("token");

  const me = await prisma.player.findUnique({
    where: { id: token },
    include: {
      game: {
        include: {
          players: true,
          roles: true,
        }
      }
    },
  });

  if (!me || !me.owner || me.gameId !== id) {
    throw error(403, "Unauthorized");
  }

  console.log(`Restarting game ${id}`);

  const game = me.game;
  const roles = game.roles.map((role) => {
    role.count = 0;
    return role;
  });
  const players = game.players.map((player) => {
    player.roleId = null;
    return player;
  }).filter((player) => !player.owner);

  for (let i = 0; i < players.length; i++) {
    let player = players[i];
    const availableRoles = roles.filter((role) => role.count < role.maxCount);
    const roleId = selectRandomElement(availableRoles)?.id;

    player.dead = false;
    player.roleId = roleId ?? null;
    roles.find((role) => role.id === roleId)!.count++;

    console.log(`Player ${player.name} assigned role ${roles.find((role) => role.id === roleId)?.name}`);
  }

  const promises = players.map((player) => prisma.player.update({
    where: { id: player.id },
    data: {
      roleId: player.roleId,
      dead: player.dead,
    },
  }));

  await Promise.all(promises);

  return json({ success: true });
}

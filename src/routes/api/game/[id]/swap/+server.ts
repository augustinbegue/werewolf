import { prisma } from "$lib/server/db";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, cookies, params }) => {
  const token = cookies.get("token");
  const me = await prisma.player.findUnique({ where: { id: token } });

  if (!me || !me.owner) throw error(401, "Unauthorized");

  const { id } = params;
  const game = await prisma.game.findUnique({ where: { id }, include: { players: true } });

  if (!game) throw error(404, "Game not found");

  if (game.players.find(p => p.owner)?.id !== me.id)
    throw error(403, "You are not the owner of this game");

  const {
    originPlayerId,
    destinationPlayerId,
  } = await request.json();

  if (!originPlayerId || !destinationPlayerId) throw error(400, "Missing parameters");

  const originPlayer = game.players.find(p => p.id === originPlayerId);
  const destinationPlayer = game.players.find(p => p.id === destinationPlayerId);

  if (!originPlayer || !destinationPlayer) throw error(404, "Player not found");

  await prisma.game.update({
    where: { id },
    data: {
      players: {
        update: [
          { where: { id: originPlayerId }, data: { roleId: destinationPlayer.roleId } },
          { where: { id: destinationPlayerId }, data: { roleId: originPlayer.roleId } },
        ],
      },
    },
  });

  console.log(`Swapped ${originPlayer.name} with ${destinationPlayer.name}`);


  return json({ success: true });
};

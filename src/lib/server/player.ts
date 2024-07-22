import { selectRandomElement } from "$lib/utils";
import { error } from "@sveltejs/kit";
import { prisma } from "./db";

export async function createPlayer(gameId: string, playerName: string, owner = false) {
  if (owner) {
    const player1 = await prisma.player.create({
      data: {
        gameId: gameId,
        name: playerName,
        owner
      }
    });

    console.log(`Player ${player1.name} created as owner`);

    return player1;
  } else {
    const roles = await prisma.role.findMany({
      where: {
        gameId: gameId
      }
    });

    const availableRoles = await prisma.role.findMany({
      where: {
        gameId: gameId,
        count: {
          lt: prisma.role.fields.maxCount
        }
      },
    });

    const roleId = selectRandomElement(availableRoles)?.id;
    if (!roleId) {
      throw error(500, "No available role");
    }

    const exists = await prisma.player.findFirst({
      where: {
        gameId: gameId,
        name: playerName
      }
    });
    if (exists) {
      throw error(409, "Player already exists");
    }

    const player1 = await prisma.player.create({
      data: {
        gameId: gameId,
        name: playerName,
        roleId,
        owner
      }
    });
    await prisma.role.update({
      where: {
        id: roleId
      },
      data: {
        count: {
          increment: 1
        }
      }
    });

    console.log(`Player ${player1.name} created with role ${availableRoles.find(r => r.id === roleId)?.name}`);

    return player1;
  }
}

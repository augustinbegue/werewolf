import { prisma } from "$lib/server/db";
import { createPlayer } from "$lib/server/player";
import type { Actions } from "./$types";

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const players = data.get("nbPlayers");
    const roles = Array.from(data.entries()).filter(([key]) => key !== "nbPlayers" && key !== "player1");

    const game = await prisma.game.create({
      data: {
        nbPlayers: parseInt(players?.toString() ?? "0"),
        roles: {
          create: roles.map(([key, value]) => ({
            name: key,
            count: 0,
            maxCount: parseInt(value.toString())
          }))
        },
      }
    });

    // Create Player and assign a role
    const player1 = await createPlayer(game.id, data.get("player1")?.toString() ?? "Player 1", true);
    cookies.set("token", player1.id, { path: "/", secure: false });

    return {
      ...game,
    };
  }
}

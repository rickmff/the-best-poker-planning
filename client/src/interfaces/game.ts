import type Player from "@/interfaces/player";
import type Ticket from "@/interfaces/tickets";

export default interface Game {
    players: Player[];
    tickets: Ticket[];
}
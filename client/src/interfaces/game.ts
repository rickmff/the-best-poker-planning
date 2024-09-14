import type Player from "@/interfaces/player";
import type Ticket from "@/interfaces/tickets";

export default interface Game {
    id: string | number;
    players: Player[];
    tickets: Ticket[];
}
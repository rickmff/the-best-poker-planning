import Player from "@/interfaces/player";
import Ticket from "@/interfaces/tickets";

export default interface Game {
    players: Player[];
    tickets: Ticket[];
}
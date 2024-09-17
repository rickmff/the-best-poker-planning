export interface Player {
    id: string;
    name: string;
    roomId: string;
    vote?: string | number;
}

export interface Ticket {
    id: string;
    roomId: string;
    votingOn: boolean;
    score?: string | number;
}

export interface GameType {
    name: string;
    values: (string | number)[];
}

export interface RoomGameType {
    id: string;
    gameType: GameType;
    roomId: string;
}
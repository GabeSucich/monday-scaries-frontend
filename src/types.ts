export type BettorDeposit = {
  amount: number;
  isReBuy: boolean;
  isQuarterlySupplement: boolean;
  createdAt: number;
  _id: string;
};

export type Bettor = {
  user: User["_id"] | User;
  bettorGroup: BettorGroup["_id"] | BettorGroup;
  createdAt: number;
  balance: number;
  deposits: BettorDeposit[];
  _id: string;
};

export type BettorGroup = {
  name: string;
  createdAt: Date;
  adminBettor?: User["_id"] | User;
  maxDeposit: number;
  maxDepositBalance?: number;
  bettors: (Bettor["_id"] | Bettor)[];
  startTimestamp?: number;
  endTimestamp?: number;
  _id: string;
};

export type ServerError = {
  createdAt: Date;
  errorString: string;
  traceback?: string;
  description: string;
  _id: string;
};

export type User = {
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  createdAt: Date;
  _id: string;
  hash?: string;
  salt?: string;
};

export type Wager = {
  createdAt: number;
  bettor: Bettor["_id"] | Bettor;
  amount: number;
  odds: number;
  contestDate: string;
  description: string;
  live: boolean;
  details: {
    betType?: string;
    sport?: string;
  };
  result?: string;
  payout?: number;
  _id: string;
};

export type ModifiedUser = {
    _id: string,
    username: string,
    firstName: string,
    lastName: string,
    email?: string,
    isAdmin: boolean
}

export type UserRegistrationData = {
    firstName: string,
    lastName: string,
    username: string,
    password: string
}

export type CreateDepositData = {
    bettor: string,
    amount: number
}

export type BettorUserData = {
    bettor: Bettor
    user: ModifiedUser
}

export type WagerDataDetails = {
    betType?: string,
    sport?: string,
}

export type CreateWagerData = {
    bettor: string,
    amount: number,
    description: string,
    odds: number,
    contestDate: string,
    details: WagerDataDetails,
    live?: boolean
}

export type WagerResult = "Win" | "Push" | "Loss" | "Cash Out"

export type UpdateWagerResultData = {
    wager: string,
    amount?: number,
    result?: WagerResult | null,
    cashOutValue?: number,
    odds?: number
}

export type UpdateWagerInfoData = {
    wager: string,
    description?: string,
    contestDate?: string,
    betType?: string,
    sport?: string,
    live?: boolean
}


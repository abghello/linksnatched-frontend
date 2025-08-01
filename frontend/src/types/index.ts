export type ILink = {
  id: string;
  userId: string;
  tags: string;
  resolvedTitle: string;
  givenTitle: string;
  displayUrl: string;
  topImageUrl: string;
  givenUrl: string;
  resolvedUrl: string;
  domain: string;
  createdAt: Date;
};

export type IUser = {
  id: string;
  email: string;
  plan: string;
  role: string;
  createdAt: Date;
};
export type IPlan = 'free' | 'premium';

export type ISubscription = {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  plan: IPlan;
  period: string;
  createdAt: Date;
};

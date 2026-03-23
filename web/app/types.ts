export type Parent = {
  id: string;
  name: string;
  email: string;
};

export type Class = {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  registered_count: number;
  start_time: string;
  end_time: string;
};

export type Registration = {
  id: string;
  class_id: string;
  class_name: string;
};

export type ActionMessage = {
  type: "ok" | "err";
  text: string;
};

export type MyRegistrations = {
  registrations: Registration[];
};

export type AdminRegistration = {
  id: string;
  class_id: string;
  class_name: string;
  parent_name: string;
  parent_email: string;
  created_at: string;
};

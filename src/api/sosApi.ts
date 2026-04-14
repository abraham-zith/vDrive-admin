import axiosIns from "./axios";

export const resolveSos = async (sosId: string) => {
  const response = await axiosIns.post("/api/sos/resolve", { sos_id: sosId });
  return response.data;
};

export const getActiveSos = async () => {
  const response = await axiosIns.get("/api/sos/active");
  return response.data;
};

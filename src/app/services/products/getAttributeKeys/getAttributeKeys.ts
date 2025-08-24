import { baseUrl } from "../../config";

export const getAttributeKeys = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${baseUrl}/api/attributes/keys`);
    if (!response.ok) {
      throw new Error();
    } else {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.error("Error fetching attribute keys:", error);
    return [];
  }
};

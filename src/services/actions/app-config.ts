import api from "@p40/lib/axios";

export async function appConfigAction(
  prevState: any,
  formData: FormData
): Promise<{ error: boolean; message?: string }> {
  try {
    const response = await api.post(`/api/event`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const result = response.data;

    if (result.error) {
      return {
        error: true,
        message: result.message || "Erro ao atualizar o evento.",
      };
    }

    return {
      error: false,
    };
  } catch (error: any) {
    console.error("Erro na appConfigAction:", error);
    return {
      error: true,
      message: error?.message || "Erro interno ao atualizar o evento.",
    };
  }
}

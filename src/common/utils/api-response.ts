import { NextResponse } from "next/server";

export class ApiResponse {
  static success<T>(data: T, status: number = 200) {
    return NextResponse.json({ data }, { status });
  }

  static created<T>(data: T) {
    return this.success(data, 201);
  }

  static noContent() {
    return new NextResponse(null, { status: 204 });
  }

  static error(
    message: string,
    code: string,
    status: number = 500,
    details?: Record<string, any>
  ) {
    return NextResponse.json(
      {
        error: {
          message,
          code,
          details,
        },
      },
      { status }
    );
  }
}

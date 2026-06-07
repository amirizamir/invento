const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
}

export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): { success: boolean; remaining: number } {
  const windowMs = options.windowMs ?? 60 * 1000;
  const maxRequests = options.maxRequests ?? 100;
  const now = Date.now();

  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxRequests - 1 };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: maxRequests - entry.count };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

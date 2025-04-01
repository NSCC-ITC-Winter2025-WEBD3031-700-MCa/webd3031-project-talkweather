import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;

export const edgePrisma = new Proxy(prisma, {
  get(target, prop) {
    if (typeof target[prop as keyof typeof target] === "function") {
      return () => {
        throw new Error(
          "PrismaClient is not configured for Edge Runtime. Use server actions or API routes instead."
        );
      };
    }
    return target[prop as keyof typeof target];
  },
});
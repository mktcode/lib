import cors, { CorsOptions } from "cors";
import { ethers } from "ethers";
import express, { Application, NextFunction, Request, Response } from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

type ApiOptions = {
  corsOrigin: CorsOptions['origin'];
  port: number;
}

export class Web3IndexerApi {
  public server: Application;

  constructor({ corsOrigin, port }: ApiOptions) {
    this.server = express();
    this.server.use(cors({ origin: corsOrigin }))
    this.server.use(this.getEOASigner)
    this.server.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`)
      console.log('\nRoutes:');
      this.server._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          console.log(middleware.route.methods.post ? 'POST' : 'GET', middleware.route.path);
        }
      });
    });
  }

  get(
    path: string,
    handler: (req: Request, res: Response) => void
  ) {
    this.server.get(path, handler)
  }

  post(
    path: string,
    handler: (req: Request, res: Response) => void
  ) {
    this.server.post(path, handler)
  }

  graphql(
    schema: ReturnType<typeof buildSchema>,
    resolvers: Record<string, any>
  ) {
    this.server.use('/graphql', graphqlHTTP({
      schema,
      rootValue: resolvers,
      graphiql: true,
    }));
  }

  private async getEOASigner(req: Request, _res: Response, next: NextFunction) {
    const signature = req.header('EOA-Signature');
    const message = req.header('EOA-Signed-Message');

    if (signature && message) {
      const signer = ethers.verifyMessage(message, signature);
      req.headers['EOA-Signer'] = signer;
    }

    next();
  }
}

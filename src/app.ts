import express, { Application, json, urlencoded } from "express";
import cors from "cors";
import { Server, createServer } from "http";
import path from "path";
import { engine } from "express-handlebars";
import currentUser from "./middlewares/current-user.middleware";
import errorHandler from "./middlewares/error.mw";
import { Mongoose, connect } from "mongoose";
import CONFIG from "./config";
import { AppConfig, NODE_ENV_TYPE } from "./global";
import authRoutes from "./routes/auth/routes";
import userRoutes from "./routes/user/routes";
import adminRoutes from "./routes/admin/routes";
import redis from "./redis";
import imageRoutes from "./routes/image-store/routes";

class App {
  public httpServer: Server;
  private mode: NODE_ENV_TYPE;
  private isTestMode: boolean;
  private port: number | string;
  private _app: Application;
  private mongo_url: string;
  private mongooseCon: null | Mongoose;
  // public listening: Server<typeof IncomingMessage, typeof ServerResponse>;
  constructor({ mode, port, mongo_url }: AppConfig) {
    this.mode = mode;
    this.isTestMode = mode === "test";
    this.port = port;
    this.mongo_url = mongo_url;
    this.mongooseCon = null;

    this._app = express();

    // add this if you need hbs engine
    // this.setupHBS();

    this.setupMiddlewares();

    this.setupRoutes();

    this.httpServer = createServer(this._app);
  }
  private setupHBS() {
    this._app.engine(".hbs", engine({ extname: ".hbs" }));
    this._app.set("view engine", ".hbs");
    this._app.set("views", path.resolve("src/views"));
  }
  public async runRedis() {
    try {
      // redis client
      redis.on("error", (err) => console.log("Redis Client Error", err));
      await redis.connect();
      !this.isTestMode && console.log("Connected to Redis");
    } catch (error) {
      console.log(error);
    }
  }
  private setupMiddlewares() {
    this._app.use(cors());
    this._app.use(json());

    // uncomment if you need urlencoded
    this._app.use(urlencoded({ extended: true }));
  }
  private setupRoutes() {
    // healthcheck route
    this._app.get("/healthcheck", currentUser, (req, res) =>
      res.json({ status: "ok" })
    );

    // write your routes here
    this._app.use("/auth", currentUser, authRoutes);
    this._app.use("/user", currentUser, userRoutes);
    this._app.use("/admin", currentUser, adminRoutes);
    this._app.use("/image", imageRoutes);

    // Add error handling middleware here
    this._app.use(errorHandler);
  }

  public async runDB() {
    try {
      await this.runRedis();
      this.mongooseCon = await connect(
        `${this.mongo_url}/${CONFIG.app_name}-${this.mode}`
      );
      !this.isTestMode && console.log("Connected to MongoDB");
    } catch (error) {
      console.log(error);
    }
  }
  private async closeRedis() {
    try {
      await redis.disconnect();
      !this.isTestMode && console.log("Disconnected from Redis");
    } catch (error) {
      console.log(error);
    }
  }
  public async closeDB() {
    try {
      await this.closeRedis();
      await this.mongooseCon?.disconnect();
      !this.isTestMode && console.log("Disconnected from MongoDB");
    } catch (error) {
      console.log(error);
    }
  }
  public async clearTestDB() {
    if (this.isTestMode) {
      await this.mongooseCon?.connection.dropDatabase();
    }
  }

  public async runServer() {
    try {
      await this.runDB();
      this.httpServer.listen(this.port, () => {
        console.log(`Server is running on port ${this.port}`);
        console.log(`Proccess ID: ${process.pid}`);
        console.log(`Running on ${this.mode} mode`);
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default App;

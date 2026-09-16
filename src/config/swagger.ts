import SwaggerParser from "@apidevtools/swagger-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadSwaggerSpec = async () => {
    const spec = await SwaggerParser.bundle(
        path.join(__dirname, "../../docs/openapi.yaml"),
    );
    return spec;
};

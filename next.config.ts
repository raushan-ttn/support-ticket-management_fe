import path from 'path';
import type { NextConfig } from 'next';

const stylesPath = path.join(process.cwd(), 'src/styles').replace(/\\/g, '/');

const nextConfig: NextConfig = {
  sassOptions: {
    additionalData: `@use "${stylesPath}/abstracts" as *;\n`,
    includePaths: [stylesPath],
  },
};

export default nextConfig;

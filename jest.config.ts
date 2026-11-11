import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config = {
    testEnvironment: "jest-environment-jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    collectCoverageFrom: [
        "app/**/*.{ts,tsx}",
        "!app/**/layout.tsx",
        "!app/**/page.tsx",
        "!**/*.d.ts",
    ],
};

export default createJestConfig(config);
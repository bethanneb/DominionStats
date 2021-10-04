import { Pool } from 'pg';
import { migrate } from 'postgres-migrations';

/**
 * Single global pool to be used for all queries
 * Grabs connection info out of environment variables:
 * PGUSER       default=??
 * PGHOST       default=localhost
 * PGPASSWORD   default=??
 * PGDATABASE   default=postgres
 * PGPORT       default=5432
 */
const pool = new Pool();

async function init(): Promise<void> {
    // startup delay to ensure cloudsql-proxy comes up
    await new Promise((res) => setTimeout(res, 5000));

    // Validate connection
    try {
        await pool.query('SELECT NOW()');
    } catch (e) {
        console.log("Failed to connect to DB: ", e);
        throw e;
    }

    // Migrate the database schema
    // Referenc: https://www.npmjs.com/package/postgres-migrations
    const client = await pool.connect();
    try {
        await migrate({client}, "db-migrations");
    } finally {
        // release the client back to the pool when we're done
        await client.release();
    }
}

// Verify connection and run migrations on startup
init().catch((e) => {
    console.error("Failed to init db_setup: ", e);
    process.exit(1);
});

interface TestObject {
    id: number;
    name: string;
    score: number;
}

interface TestObject2 {
    id: number;
    name: string;
    score: number;
    victoryPoints: number;
}

// interface TestObject3 {
//     id: number;
//     Game_Label: string;
//     Player_Num: number;
//     Player_Name: string;
//     Victory_Points: number;
// }

export async function testQueryAll(): Promise<TestObject[]> {
    const res = await pool.query("SELECT id, name, score FROM test_table") 
    return res.rows as TestObject[];
}

export async function testQueryAll2(): Promise<TestObject2[]> {
    const res = await pool.query("SELECT id, name, score, victoryPoints FROM test_table_2");
    return res.rows as TestObject2[];
}

// export async function testQueryAll3(): Promise<TestObject3[]> {
//     const res = await pool.query("SELECT id, Game_Label, Player_Num, Player_Name, Victory_Points FROM test_table_3");
//     return res.rows as TestObject3[];
// }
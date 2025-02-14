/*
 * Deepkit Framework
 * Copyright (C) 2021 Deepkit UG, Marc J. Schmidt
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License.
 *
 * You should have received a copy of the MIT License along with this program.
 */

import 'reflect-metadata';
import { BenchSuite } from '../../../bench';
import { spawnSync } from 'child_process';

export async function main() {
    const count = 10_000;

    throw new Error('Not supported yet');

    spawnSync(`./node_modules/.bin/prisma generate --schema src/orm/end-to-end/mongo/model.prisma`, { stdio: 'inherit', shell: true });
    // spawnSync(`./node_modules/.bin/prisma db push --schema=src/orm/end-to-end/mongo/model.prisma --force-reset`, {stdio: 'inherit', shell: true});

    const {PrismaClient} = await import('@prisma/client');
    const prisma = new PrismaClient();

    const bench = new BenchSuite('prisma');
    let created = false;
    for (let i = 0; i < 5; i++) {
        console.log('round', i);

        if (!created) {
            created = true;
            await prisma.model.deleteMany({});
            const items: any[] = [];
            for (let i = 1; i <= count; i++) {
                items.push({
                    username: 'Peter ' + i,
                    tags: 'a,b,c',
                    priority: 5,
                    ready: true,
                });
            }

            await bench.runAsyncFix(1, 'insert', async () => {
                await prisma.model.createMany({ data: items });
            });
        }

        await bench.runAsyncFix(10, 'fetch', async () => {
            //Prisma crashes when we go beyond 100 ...
            const users = await prisma.model.findMany();
        });

        await bench.runAsyncFix(100, 'fetch-1', async () => {
            const user = await prisma.model.findFirst();
        });

        // const dbItems = await session.query(DeepkitModel).find();
        // for (const item of dbItems) {
        //     item.priority++;
        // }
        //
        // await bench.runAsyncFix(1, 'update', async () => {
        //     await session.commit();
        // });
        //
        // await bench.runAsyncFix(1, 'remove', async () => {
        //     for (const item of dbItems) {
        //         session.remove(item);
        //     }
        //
        //     await session.commit();
        // });
    }

    prisma.$disconnect();
}

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Créer un admin par défaut
    const adminEmail = 'admin@frechnel.com';
    const adminPassword = 'freshnel2024'; // À changer en production !

    // Hash du mot de passe
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.admin.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        await prisma.admin.create({
            data: {
                email: adminEmail,
                passwordHash: passwordHash,
            },
        });
        console.log('✅ Admin créé:', adminEmail);
        console.log('🔑 Mot de passe:', adminPassword);
    } else {
        console.log('ℹ️  Admin existe déjà');
    }

    // Créer des catégories de base
    const categories = [
        { name: 'Hoodies', slug: 'hoodies' },
        { name: 'T-Shirts', slug: 't-shirts' },
        { name: 'Pantalons', slug: 'pantalons' },
        { name: 'Sneakers', slug: 'sneakers' },
        { name: 'Vestes', slug: 'vestes' },
        { name: 'Accessoires', slug: 'accessoires' },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    console.log('✅ Catégories créées');

    console.log('🎉 Seeding terminé !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

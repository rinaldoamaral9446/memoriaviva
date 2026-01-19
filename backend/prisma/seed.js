const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting multi-tenant seed...\n');

    // Create Organizations
    console.log('📦 Creating organizations...');

    const orgDemo = await prisma.organization.upsert({
        where: { slug: 'demo' },
        update: {},
        create: {
            name: 'Organização Demo',
            slug: 'demo',
            domain: 'demo.memoriaviva.com.br',
            logo: null,
            primaryColor: '#4B0082',
            secondaryColor: '#D4AF37',
            config: JSON.stringify({
                aiInstructions: 'Foco em memórias culturais gerais e eventos históricos.',
                features: ['memories', 'timeline', 'ai']
            }),
            isActive: true
        }
    });

    const orgSP = await prisma.organization.upsert({
        where: { slug: 'sp' },
        update: {},
        create: {
            name: 'Prefeitura de São Paulo',
            slug: 'sp',
            domain: 'sp.memoriaviva.com.br',
            logo: null,
            primaryColor: '#006633', // Verde da bandeira de SP
            secondaryColor: '#FFD700', // Dourado
            config: JSON.stringify({
                aiInstructions: 'Enfatize eventos históricos municipais, patrimônio cultural paulistano e memórias da cidade de São Paulo. Destaque datas, locais importantes e personalidades históricas.',
                features: ['memories', 'timeline', 'ai', 'reports']
            }),
            isActive: true
        }
    });

    const orgRio = await prisma.organization.upsert({
        where: { slug: 'rio' },
        update: {},
        create: {
            name: 'Prefeitura do Rio de Janeiro',
            slug: 'rio',
            domain: 'rio.memoriaviva.com.br',
            logo: null,
            primaryColor: '#0047AB', // Azul
            secondaryColor: '#FFFFFF', // Branco
            config: JSON.stringify({
                aiInstructions: 'Valorize a cultura carioca, carnaval, bossa nova e eventos históricos do Rio de Janeiro. Contextualize com bairros, praias e marcos icônicos da cidade.',
                features: ['memories', 'timeline', 'ai', 'carnival-mode']
            }),
            isActive: true
        }
    });

    const orgEmpresa = await prisma.organization.upsert({
        where: { slug: 'empresa-abc' },
        update: {},
        create: {
            name: 'Empresa ABC Ltda',
            slug: 'empresa-abc',
            domain: 'abc.memoriaviva.com.br',
            logo: null,
            primaryColor: '#1E3A8A', // Azul corporativo
            secondaryColor: '#F59E0B', // Laranja
            config: JSON.stringify({
                aiInstructions: 'Foque em cultura corporativa, marcos da empresa, eventos internos e memórias dos colaboradores. Destaque achievements, projetos e valores da organização.',
                features: ['memories', 'timeline', 'ai', 'team-awards']
            }),
            isActive: true
        }
    });

    const orgMaceio = await prisma.organization.upsert({
        where: { slug: 'maceio' },
        update: {},
        create: {
            name: 'Prefeitura de Maceió',
            slug: 'maceio',
            domain: 'maceio.memoriaviva.com.br',
            logo: null,
            primaryColor: '#0095DA', // Azul Maceió
            secondaryColor: '#FFFFFF', // Branco
            config: JSON.stringify({
                aiInstructions: 'Foque na cultura alagoana, folclore, artesanato e belezas naturais de Maceió. Destaque o Guerreiro, o Pastoril e a história dos bairros tradicionais.',
                features: ['memories', 'timeline', 'ai', 'folklore-mode']
            }),
            isActive: true
        }
    });

    console.log(`✅ Created ${4} organizations\n`);

    // Helper to create default roles for an organization
    const createDefaultRoles = async (orgId) => {
        const adminRole = await prisma.role.upsert({
            where: { organizationId_slug: { organizationId: orgId, slug: 'admin' } },
            update: {},
            create: {
                name: 'Administrador',
                slug: 'admin',
                description: 'Acesso total a todas as funcionalidades da organização.',
                permissions: JSON.stringify({
                    memories: ['create', 'read', 'update', 'delete', 'publish'],
                    users: ['create', 'read', 'update', 'delete'],
                    settings: ['read', 'update'],
                    analytics: ['read']
                }),
                isSystem: true,
                organizationId: orgId
            }
        });

        const editorRole = await prisma.role.upsert({
            where: { organizationId_slug: { organizationId: orgId, slug: 'editor' } },
            update: {},
            create: {
                name: 'Editor',
                slug: 'editor',
                description: 'Pode criar e editar memórias, mas não gerenciar usuários.',
                permissions: JSON.stringify({
                    memories: ['create', 'read', 'update'],
                    users: ['read'],
                    settings: [],
                    analytics: ['read']
                }),
                isSystem: true,
                organizationId: orgId
            }
        });

        const userRole = await prisma.role.upsert({
            where: { organizationId_slug: { organizationId: orgId, slug: 'user' } },
            update: {},
            create: {
                name: 'Colaborador',
                slug: 'user',
                description: 'Pode visualizar memórias e criar rascunhos.',
                permissions: JSON.stringify({
                    memories: ['create_draft', 'read'],
                    users: [],
                    settings: [],
                    analytics: []
                }),
                isSystem: true,
                organizationId: orgId
            }
        });

        return { admin: adminRole, editor: editorRole, user: userRole };
    };

    console.log('🛡️ Creating default roles...');
    const demoRoles = await createDefaultRoles(orgDemo.id);
    const spRoles = await createDefaultRoles(orgSP.id);
    const rioRoles = await createDefaultRoles(orgRio.id);
    const empresaRoles = await createDefaultRoles(orgEmpresa.id);
    const maceioRoles = await createDefaultRoles(orgMaceio.id);

    // Create Users for each organization
    console.log('👥 Creating users...');

    const hashedPassword = await bcrypt.hash('senha123', 10);

    // Demo Org Users
    const demoAdmin = await prisma.user.upsert({
        where: { email: 'admin@demo.com' },
        update: { role: 'super_admin' }, // Super admin doesn't need a roleId in this context yet, or we can give him admin role
        create: {
            organizationId: orgDemo.id,
            name: 'Admin Demo',
            email: 'admin@demo.com',
            password: hashedPassword,
            role: 'super_admin',
            roleId: demoRoles.admin.id
        }
    });

    const demoUser = await prisma.user.upsert({
        where: { email: 'teste@example.com' },
        update: { organizationId: orgDemo.id, roleId: demoRoles.user.id },
        create: {
            organizationId: orgDemo.id,
            name: 'Usuário Teste',
            email: 'teste@example.com',
            password: hashedPassword,
            role: 'user',
            roleId: demoRoles.user.id
        }
    });

    // SP Users
    const spAdmin = await prisma.user.upsert({
        where: { email: 'gestor@sp.gov.br' },
        update: { roleId: spRoles.admin.id },
        create: {
            organizationId: orgSP.id,
            name: 'Gestor Cultural SP',
            email: 'gestor@sp.gov.br',
            password: hashedPassword,
            role: 'admin',
            roleId: spRoles.admin.id
        }
    });

    const spEditor = await prisma.user.upsert({
        where: { email: 'historiador@sp.gov.br' },
        update: { roleId: spRoles.editor.id },
        create: {
            organizationId: orgSP.id,
            name: 'Historiador Municipal',
            email: 'historiador@sp.gov.br',
            password: hashedPassword,
            role: 'editor',
            roleId: spRoles.editor.id
        }
    });

    // Rio Users
    const rioAdmin = await prisma.user.upsert({
        where: { email: 'cultura@rio.gov.br' },
        update: { roleId: rioRoles.admin.id },
        create: {
            organizationId: orgRio.id,
            name: 'Secretaria de Cultura RJ',
            email: 'cultura@rio.gov.br',
            password: hashedPassword,
            role: 'admin',
            roleId: rioRoles.admin.id
        }
    });

    // Empresa Users
    const empresaAdmin = await prisma.user.upsert({
        where: { email: 'rh@empresaabc.com' },
        update: { roleId: empresaRoles.admin.id },
        create: {
            organizationId: orgEmpresa.id,
            name: 'RH Empresa ABC',
            email: 'rh@empresaabc.com',
            password: hashedPassword,
            role: 'admin',
            roleId: empresaRoles.admin.id
        }
    });

    // Maceió Users
    const maceioAdmin = await prisma.user.upsert({
        where: { email: 'cultura@maceio.gov.br' },
        update: { roleId: maceioRoles.admin.id },
        create: {
            organizationId: orgMaceio.id,
            name: 'Secretaria de Cultura Maceió',
            email: 'cultura@maceio.gov.br',
            password: hashedPassword,
            role: 'admin',
            roleId: maceioRoles.admin.id
        }
    });

    // [New] Create School Units for Maceió
    console.log('🏫 Creating School Units for Maceió...');
    const schoolsData = [
        { name: 'CMEI Ana Carolina', address: 'Tabuleiro do Martins' },
        { name: 'Escola Municipal Pompeu Sarmento', address: 'Barro Duro' },
        { name: 'CMEI Pingo de Gente', address: 'Jacintinho' }
    ];

    for (const school of schoolsData) {
        // Simple check to avoid duplicates during re-runs
        const existing = await prisma.schoolUnit.findFirst({
            where: { name: school.name, organizationId: orgMaceio.id }
        });

        if (!existing) {
            await prisma.schoolUnit.create({
                data: {
                    name: school.name,
                    address: school.address,
                    organizationId: orgMaceio.id
                }
            });
        }
    }
    console.log(`✅ Created/Verified School Units for Maceió\n`);

    console.log(`✅ Created ${6} users with roles\n`);

    // Migrate existing memories to Demo org
    console.log('📝 Migrating existing memories to Demo org...');

    const existingMemories = await prisma.memory.findMany({
        where: { organizationId: undefined }
    });

    if (existingMemories.length > 0) {
        await prisma.memory.updateMany({
            where: { organizationId: undefined },
            data: { organizationId: orgDemo.id }
        });
        console.log(`✅ Migrated ${existingMemories.length} memories to Demo org\n`);
    } else {
        console.log(`ℹ️  No existing memories to migrate\n`);
    }

    // Create sample memories for each organization
    console.log('📸 Creating sample memories...');

    // SP Memory
    await prisma.memory.create({
        data: {
            organizationId: orgSP.id,
            userId: spEditor.id,
            title: 'Fundação do Theatro Municipal',
            description: 'Inauguração do Theatro Municipal de São Paulo em 1911',
            content: 'O Theatro Municipal de São Paulo foi inaugurado em 12 de setembro de 1911, tornando-se um dos mais importantes teatros da cidade e do Brasil.',
            eventDate: new Date('1911-09-12'),
            location: 'Praça Ramos de Azevedo, Centro, São Paulo',
            category: 'Patrimônio Histórico',
            tags: JSON.stringify(['teatro', 'cultura', 'patrimônio', 'centro']),
            aiGenerated: false
        }
    });

    // Rio Memory
    await prisma.memory.create({
        data: {
            organizationId: orgRio.id,
            userId: rioAdmin.id,
            title: 'Cristo Redentor - Maravilha do Mundo',
            description: 'O Cristo Redentor eleito uma das Novas Sete Maravilhas do Mundo',
            content: 'Em 7 de julho de 2007, o Cristo Redentor foi eleito uma das Novas Sete Maravilhas do Mundo, consolidando sua importância cultural e turística global.',
            eventDate: new Date('2007-07-07'),
            location: 'Corcovado, Rio de Janeiro',
            category: 'Marco Cultural',
            tags: JSON.stringify(['cristo', 'turismo', 'patrimônio', 'mundial']),
            aiGenerated: false
        }
    });

    // Empresa Memory
    await prisma.memory.create({
        data: {
            organizationId: orgEmpresa.id,
            userId: empresaAdmin.id,
            title: 'Primeira Convenção de Vendas',
            description: 'Inauguração das convenções anuais da Empresa ABC',
            content: 'A primeira convenção de vendas da Empresa ABC reuniu 200 colaboradores e estabeleceu novos recordes de performance.',
            eventDate: new Date('2020-03-15'),
            location: 'Hotel Royal, São Paulo',
            category: 'Eventos Corporativos',
            tags: JSON.stringify(['vendas', 'convenção', 'equipe', 'achievement']),
            aiGenerated: false
        }
    });

    console.log(`✅ Created ${3} sample memories\n`);

    console.log('🎉 Multi-tenant seed completed!\n');
    console.log('📋 Summary:');
    console.log(`   - Organizations: ${4}`);
    console.log(`   - Users: ${6}`);
    console.log(`   - Memories: ${3}\n`);
    console.log('🔑 Test Credentials:');
    console.log('   Demo Admin: admin@demo.com / senha123');
    console.log('   SP Gestor: gestor@sp.gov.br / senha123');
    console.log('   Rio Cultura: cultura@rio.gov.br / senha123');
    console.log('   Empresa RH: rh@empresaabc.com / senha123');
    console.log('   Maceió Cultura: cultura@maceio.gov.br / senha123\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

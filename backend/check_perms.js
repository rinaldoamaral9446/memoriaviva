
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPermissions() {
    const user = await prisma.user.findUnique({
        where: { id: 1 },
        include: { userRole: true, organization: true }
    });

    console.log('User 1:', user.name);
    console.log('Role:', user.role); // Standard column
    console.log('Organization:', user.organization?.name);
    console.log('RBAC Role:', user.userRole?.name);
    console.log('RBAC Permissions:', user.userRole?.permissions);

    // Check Organization 2 access
    if (user.role === 'super_admin') {
        console.log('User is Super Admin, usually has global access.');
    } else {
        console.log('User is NOT Super Admin.');
    }
}

checkPermissions()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

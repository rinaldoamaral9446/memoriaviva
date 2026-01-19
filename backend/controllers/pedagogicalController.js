const PedagogicalService = require('../services/pedagogicalService');
const PDFService = require('../services/pdfService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createLessonPlan = async (req, res) => {
    try {
        const { memories, gradeLevel, subject, topic } = req.body;
        const userId = parseInt(req.user.userId);
        const organizationId = parseInt(req.user.organizationId);

        const plan = await PedagogicalService.generateLessonPlan(memories, gradeLevel, subject, topic, userId, organizationId);

        res.json({ success: true, plan });
    } catch (error) {
        console.error('Error creating lesson plan:', error);
        res.status(500).json({ success: false, error: 'Failed to generate plan' });
    }
};

exports.downloadLessonPlanPDF = async (req, res) => {
    try {
        const planId = parseInt(req.params.id);
        const planRecord = await prisma.lessonPlan.findUnique({
            where: { id: planId }
        });

        if (!planRecord) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        // Fetch Organization Info for Header
        const organization = await prisma.organization.findUnique({
            where: { id: planRecord.organizationId }
        });

        const planData = JSON.parse(planRecord.content);

        // Set Headers for Download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Plano_Aula_BNCC_${planId}.pdf`);

        await PDFService.generateLessonPlanPDF(planData, organization, res);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
};

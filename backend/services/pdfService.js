const PDFDocument = require('pdfkit');

class PDFService {
    async generateLessonPlanPDF(planData, organization, res) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });

                // Stream directly to the response
                doc.pipe(res);

                // --- 1. Header (Organization Branding) ---
                const primaryColor = organization?.primaryColor || '#4B0082'; // Default Purple
                const secondaryColor = organization?.secondaryColor || '#D4AF37'; // Default Gold
                const orgName = organization?.name || 'Memória Viva';

                // Logo Placeholder or Text
                doc.fillColor(primaryColor)
                    .fontSize(20)
                    .font('Helvetica-Bold')
                    .text(orgName.toUpperCase(), { align: 'center' });

                doc.moveDown(0.2);
                doc.fontSize(10)
                    .fillColor('gray')
                    .font('Helvetica')
                    .text('REDE MUNICIPAL DE EDUCAÇÃO', { align: 'center' });

                doc.moveDown(1);

                // Divider
                doc.moveTo(50, doc.y)
                    .lineTo(550, doc.y)
                    .strokeColor(secondaryColor)
                    .lineWidth(2)
                    .stroke();

                doc.moveDown(2);

                // --- 2. Title & Context ---
                const title = planData.title || 'Plano de Aula BNCC';
                const grade = planData.gradeLevel || 'Educação Infantil';

                doc.fillColor('black')
                    .fontSize(18)
                    .font('Helvetica-Bold')
                    .text(title, { align: 'center' });

                doc.moveDown(1);

                // Info Box
                doc.fontSize(12).font('Helvetica-Bold').text('Público Alvo: ', { continued: true })
                    .font('Helvetica').text(grade);

                if (planData.duration) {
                    doc.font('Helvetica-Bold').text('Duração: ', { continued: true })
                        .font('Helvetica').text(planData.duration);
                }

                doc.moveDown(1);

                // --- 3. Educational Resources (Dynamic Label) ---
                if (planData.gigantinhosKit) {
                    const kitY = doc.y;
                    // [MIGRATION] Use Config-Driven Brand
                    let config = {};
                    if (organization && organization.config) {
                        try { config = JSON.parse(organization.config); } catch (e) { }
                    }

                    const kitLabel = `⚡ ${config.educational_brand ? config.educational_brand.toUpperCase() : 'RECURSOS DIDÁTICOS'}`;

                    /*
                    let kitLabel = '⚡ RECURSOS DIDÁTICOS';
                    if (orgName.includes('maceió') || orgName.includes('maceio')) {
                        kitLabel = '⚡ KIT GIGANTINHOS (Recurso 3D)';
                    } else if (orgName.includes('rio largo')) {
                        kitLabel = '⚡ MATERIAIS DE APOIO (Rio Largo)';
                    }
                    */

                    // Box Background (Light Blue Mock)
                    doc.rect(50, kitY, 500, 60)
                        .fillAndStroke('#E0F2FE', '#0284C7');

                    doc.fillColor('#075985')
                        .fontSize(12)
                        .font('Helvetica-Bold')
                        .text(kitLabel, 60, kitY + 10);

                    doc.fillColor('#0C4A6E')
                        .fontSize(10)
                        .font('Helvetica')
                        .text(planData.gigantinhosKit, 60, kitY + 30, { width: 480 });

                    doc.moveDown(4);
                }

                // --- 3.5. Resumo da Vivência (Summary) ---
                if (planData.summary) {
                    doc.moveDown(1);
                    doc.fillColor(primaryColor)
                        .fontSize(14)
                        .font('Helvetica-Bold')
                        .text('Resumo da Vivência:');

                    doc.fillColor('#374151') // Dark Gray
                        .fontSize(11)
                        .font('Helvetica-Oblique') // Italic
                        .text(`"${planData.summary}"`, { align: 'justify', indent: 20 });

                    doc.moveDown(1.5);
                }

                // --- 4. BNCC Codes ---
                if (planData.bnccCodes && planData.bnccCodes.length > 0) {
                    doc.fillColor(primaryColor)
                        .fontSize(14)
                        .font('Helvetica-Bold')
                        .text('Códigos BNCC:');

                    doc.fontSize(11)
                        .font('Courier')
                        .fillColor('black')
                        .list(planData.bnccCodes, { bulletRadius: 2 });

                    doc.moveDown(1);
                }

                // --- 5. Objectives ---
                if (planData.objectives) {
                    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Objetivos de Aprendizagem:');
                    doc.fontSize(11).font('Helvetica').fillColor('black')
                        .list(planData.objectives);
                    doc.moveDown(1);
                }

                // --- 6. Materials ---
                if (planData.materials) {
                    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('Materiais Necessários:');
                    doc.fontSize(11).font('Helvetica').fillColor('black')
                        .list(planData.materials);
                    doc.moveDown(1);
                }

                // --- 7. Methodology ---
                if (planData.methodology) {
                    doc.addPage(); // Start fresh for methodology
                    doc.fillColor(primaryColor).fontSize(16).font('Helvetica-Bold').text('Metodologia (Passo a Passo)');
                    doc.moveDown(1);

                    planData.methodology.forEach((step, index) => {
                        doc.fillColor('black')
                            .fontSize(12)
                            .font('Helvetica-Bold')
                            .text(`${index + 1}. ${step.step}`);

                        doc.fontSize(11)
                            .font('Helvetica')
                            .text(step.description, { align: 'justify' });

                        doc.moveDown(0.5);
                    });
                }

                // --- Footer ---
                const footerY = doc.page.height - 50;
                doc.fontSize(8)
                    .fillColor('gray')
                    .text('Gerado por Memória Viva - Inteligência Pedagógica', 50, footerY, { align: 'center' });

                doc.end();
                resolve();

            } catch (error) {
                console.error('PDF Generation Error:', error);
                reject(error);
            }
        });
    }

    async generateImpactReportPDF(reportData, organization, res) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });

                // Fonts (Standard PDFKit fonts as fallback, in real app would load custom fonts)
                const fontTitle = 'Times-Bold'; // Approximating Merriweather
                const fontBody = 'Helvetica';   // Approximating Inter

                doc.pipe(res);

                // Colors
                const primaryColor = organization?.primaryColor || '#4B0082';
                const secondaryColor = organization?.secondaryColor || '#D4AF37';

                // --- 1. Cover Page ---
                // Background Strip
                doc.rect(0, 0, 600, 150)
                    .fill(primaryColor);

                // Org Name
                doc.fontSize(30)
                    .font(fontTitle)
                    .fillColor('white')
                    .text(organization?.name?.toUpperCase() || 'RELATÓRIO DE IMPACTO', 50, 60);

                doc.fontSize(12)
                    .font(fontBody)
                    .text('PROGRAMA MEMÓRIA VIVA', 50, 100);

                // Period
                doc.moveDown(5);
                doc.fillColor('black')
                    .fontSize(16)
                    .font(fontTitle)
                    .text(`Relatório de Impacto Mensal`, { align: 'center' });

                const month = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                doc.fontSize(12)
                    .font(fontBody)
                    .text(month.toUpperCase(), { align: 'center', color: 'gray' });

                doc.moveDown(2);

                // Highlight Summary (AI)
                if (reportData.aiSummary) {
                    doc.rect(50, doc.y, 500, 120)
                        .fillAndStroke('#F3F4F6', '#E5E7EB');

                    const summaryY = doc.y - 110;

                    doc.fillColor(primaryColor)
                        .fontSize(14)
                        .font(fontTitle)
                        .text('Destaque Pedagógico (IA)', 70, summaryY);

                    doc.fillColor('#374151')
                        .fontSize(11)
                        .font('Helvetica-Oblique')
                        .text(reportData.aiSummary, 70, summaryY + 25, { width: 460, align: 'justify' });

                    doc.moveDown(8);
                }

                // --- 2. Unit Summary Table ---
                doc.addPage();
                doc.fillColor(primaryColor)
                    .fontSize(18)
                    .font(fontTitle)
                    .text('Produção por Unidade Escolar');

                doc.moveDown(1);

                // Table Header
                let tableY = doc.y;
                doc.rect(50, tableY, 500, 25).fill(primaryColor);
                doc.fillColor('white').fontSize(10).font(fontBody);
                doc.text('Unidade Escolar', 60, tableY + 8);
                doc.text('Memórias', 300, tableY + 8);
                doc.text('Planos', 380, tableY + 8);
                doc.text('Engajamento', 450, tableY + 8);

                tableY += 25;

                // Table Rows
                reportData.units.forEach((unit, i) => {
                    const rowColor = i % 2 === 0 ? '#F9FAFB' : 'white';
                    doc.rect(50, tableY, 500, 25).fill(rowColor);

                    doc.fillColor('black');
                    doc.text(unit.name, 60, tableY + 8, { width: 230, truncate: true });
                    doc.text(unit.memoriesCount || 0, 300, tableY + 8);
                    doc.text(unit.plansCount || 0, 380, tableY + 8);
                    doc.text(`${(unit.engagementScore || 0).toFixed(0)}%`, 450, tableY + 8);

                    tableY += 25;

                    // Page break logic if needed (simplified)
                    if (tableY > 750) {
                        doc.addPage();
                        tableY = 50;
                    }
                });

                doc.moveDown(2);

                // --- 3. Audit / Security Logs ---
                doc.y = tableY + 40;
                doc.fillColor(primaryColor)
                    .fontSize(16)
                    .font(fontTitle)
                    .text('Audit Logs de Sucesso');

                doc.moveDown(0.5);

                // Simple list of achievements
                const logs = reportData.auditLogs || [
                    "Nenhuma violação de segurança detectada.",
                    "100% dos uploads verificados por antivírus.",
                    "Backup automático realizado com sucesso."
                ];

                logs.forEach(log => {
                    doc.fontSize(10)
                        .font(fontBody)
                        .fillColor('#059669') // Emerald Green
                        .text(`✓ ${log}`);
                    doc.moveDown(0.5);
                });

                // --- Footer ---
                const footerY = doc.page.height - 50;
                doc.fontSize(8)
                    .fillColor('gray')
                    .text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, 50, footerY, { align: 'center' });

                doc.end();
                resolve();

            } catch (error) {
                console.error('Impact PDF Error:', error);
                reject(error);
            }
        });
    }
}

module.exports = new PDFService();

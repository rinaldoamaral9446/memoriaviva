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

                // --- 3. Gigantinhos Kit (Review Box) ---
                if (planData.gigantinhosKit) {
                    const kitY = doc.y;

                    // Box Background (Light Blue Mock)
                    doc.rect(50, kitY, 500, 60)
                        .fillAndStroke('#E0F2FE', '#0284C7');

                    doc.fillColor('#075985')
                        .fontSize(12)
                        .font('Helvetica-Bold')
                        .text('⚡ KIT GIGANTINHOS (Recurso 3D)', 60, kitY + 10);

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
}

module.exports = new PDFService();

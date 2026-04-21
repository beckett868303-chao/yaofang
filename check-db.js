const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('Connecting to database...');
    
    // 检查所有处方图片
    const images = await prisma.prescriptionImage.findMany({
      include: {
        visit: {
          include: {
            patient: true
          }
        }
      }
    });
    
    console.log('\nPrescription Images:', images.length);
    
    images.forEach((image, index) => {
      console.log(`\nImage ${index + 1}:`);
      console.log('ID:', image.id);
      console.log('Image Path:', image.imagePath);
      console.log('OCR Result:', image.ocrResult ? image.ocrResult.substring(0, 100) + '...' : 'No OCR result');
      console.log('Patient:', image.visit?.patient?.name);
      console.log('Visit Date:', image.visit?.visitDate);
    });
    
    // 检查所有病人
    const patients = await prisma.patient.findMany({
      include: {
        visits: {
          include: {
            prescriptions: true
          }
        }
      }
    });
    
    console.log('\n\nPatients:', patients.length);
    patients.forEach((patient, index) => {
      console.log(`\nPatient ${index + 1}: ${patient.name}`);
      console.log('Visits:', patient.visits.length);
      patient.visits.forEach((visit, visitIndex) => {
        console.log(`  Visit ${visitIndex + 1} (${visit.visitDate}): ${visit.prescriptions.length} prescriptions`);
        visit.prescriptions.forEach((prescription, presIndex) => {
          console.log(`    Prescription ${presIndex + 1}: ${prescription.imagePath}`);
        });
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
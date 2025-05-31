import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateCertificate = async (req, res) => {
  const { userName, examName, score } = req.body;

  // Validate input
  if (!userName || !examName || !score) {
    console.log('Missing fields:', { userName, examName, score });
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  const fileName = `${userName}-${examName}.pdf`;
  const filePath = path.join(process.cwd(), 'certificates', fileName);

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      console.log('Created directory:', dir);
    } catch (err) {
      console.error('Directory creation error:', err);
      return res.status(500).json({ msg: 'Failed to create directory', error: err.message });
    }
  }

  try {
    const doc = new PDFDocument();
    console.log('Generating PDF at:', filePath);

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Add content
    doc.fontSize(25).text('Certificate of Completion', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Awarded to: ${userName}`, { align: 'center' });
    doc.moveDown();
    doc.text(`For passing: ${examName}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Score: ${score}`, { align: 'center' });

    doc.end();

    writeStream.on('finish', () => {
      console.log('PDF written successfully');
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ msg: 'Error downloading certificate' });
        }
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Unlink error:', unlinkErr);
        });
      });
    });

    writeStream.on('error', (err) => {
      console.error('Write stream error:', err);
      res.status(500).json({ msg: 'Error writing PDF', error: err.message });
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
import QRCode from 'qrcode';
import Cafe from '../models/Cafe.js';

// @desc    Generate QR code for table
// @route   POST /api/cafes/:cafeId/qr-codes
// @access  Private (Cafe Owner)
export const generateTableQRCode = async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { tableNumber, tableId } = req.body;

    // Verify cafe ownership
    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to generate QR codes for this cafe'
      });
    }

    // Generate QR code URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const qrUrl = `${frontendUrl}/menu/${cafeId}?table=${tableNumber}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    // Update table with QR code info
    const table = cafe.tables.id(tableId);
    if (table) {
      table.qrCode = {
        url: qrUrl,
        dataUrl: qrCodeDataUrl,
        generatedAt: new Date()
      };
      await cafe.save();
    }

    res.status(200).json({
      success: true,
      data: {
        qrUrl,
        qrCodeDataUrl,
        tableNumber,
        tableId
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all QR codes for cafe
// @route   GET /api/cafes/:cafeId/qr-codes
// @access  Private (Cafe Owner)
export const getCafeQRCodes = async (req, res) => {
  try {
    const { cafeId } = req.params;

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view QR codes for this cafe'
      });
    }

    // Extract QR code data from tables
    const qrCodes = cafe.tables
      .filter(table => table.qrCode && table.qrCode.url)
      .map(table => ({
        tableId: table._id,
        tableNumber: table.number,
        qrCode: table.qrCode,
        seatingCapacity: table.seatingCapacity,
        location: table.location
      }));

    res.status(200).json({
      success: true,
      count: qrCodes.length,
      data: qrCodes
    });
  } catch (error) {
    console.error('Get cafe QR codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Generate bulk QR codes for all tables
// @route   POST /api/cafes/:cafeId/qr-codes/bulk
// @access  Private (Cafe Owner)
export const generateBulkQRCodes = async (req, res) => {
  try {
    const { cafeId } = req.params;

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to generate QR codes for this cafe'
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const generatedQRCodes = [];

    // Generate QR codes for all tables
    for (const table of cafe.tables) {
      const qrUrl = `${frontendUrl}/menu/${cafeId}?table=${table.number}`;
      
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          quality: 0.92,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          width: 256
        });

        table.qrCode = {
          url: qrUrl,
          dataUrl: qrCodeDataUrl,
          generatedAt: new Date()
        };

        generatedQRCodes.push({
          tableId: table._id,
          tableNumber: table.number,
          qrUrl,
          qrCodeDataUrl
        });
      } catch (qrError) {
        console.error(`Error generating QR code for table ${table.number}:`, qrError);
      }
    }

    await cafe.save();

    res.status(200).json({
      success: true,
      message: `Generated ${generatedQRCodes.length} QR codes`,
      data: generatedQRCodes
    });
  } catch (error) {
    console.error('Generate bulk QR codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Download QR code as image
// @route   GET /api/cafes/:cafeId/qr-codes/:tableId/download
// @access  Private (Cafe Owner)
export const downloadQRCode = async (req, res) => {
  try {
    const { cafeId, tableId } = req.params;

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (cafe.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to download QR codes for this cafe'
      });
    }

    const table = cafe.tables.id(tableId);
    if (!table || !table.qrCode) {
      return res.status(404).json({
        success: false,
        message: 'QR code not found for this table'
      });
    }

    // Convert data URL to buffer
    const base64Data = table.qrCode.dataUrl.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    res.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="table-${table.number}-qr.png"`,
      'Content-Length': imageBuffer.length
    });

    res.send(imageBuffer);
  } catch (error) {
    console.error('Download QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
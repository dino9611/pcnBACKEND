import fs from 'fs';
import multer from 'multer';

// Return multer object
export const uploader = (destination, fileNamePrefix, extensions = null) => {
  const defaultPath = './src/public';

  // if (process.env.NODE_ENV === 'production') {
  //     defaultPath = "./dist/public"
  // }

  const imageFilter = (req, file, callback) => {
    if (extensions) {
      const extFilter = extensions[file.fieldname];

      if (extFilter) {
        // const ext = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx)$/;
        const ext = new RegExp(`.(${extFilter})$`);

        if (!file.originalname.match(ext)) {
          return callback(
            new Error('Only selected file type are allowed'),
            false
          );
        }
      }
    }
    callback(null, true);
  };

  const storage = multer.diskStorage({
    // destination: function (req, file, cb) {
    //     cb(null, defaultPath + destination)
    // },
    destination: (req, file, cb) => {
      const dir = defaultPath + destination;

      if (fs.existsSync(dir)) {
        cb(null, dir);
      } else {
        fs.mkdir(dir, err => cb(err, dir));
      }
    },
    filename: (req, file, cb) => {
      const originalname = file.originalname;
      const ext = originalname.split('.');
      const filename = `${fileNamePrefix + Date.now()}.${ext[ext.length - 1]}`;

      cb(null, filename);
    }
  });

  return multer({
    storage,
    fileFilter: imageFilter,
    limits: { fieldSize: 10 * 1024 * 1024 }
  });
};

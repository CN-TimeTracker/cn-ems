const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Define Models
const UserSchema = new mongoose.Schema({ name: String, salary: Number, employeeCode: String });
const AttendanceSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, date: Date });
const LeaveSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, status: String, startDate: Date, endDate: Date });
const HolidaySchema = new mongoose.Schema({ date: Date, name: String });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
const Leave = mongoose.models.Leave || mongoose.model('Leave', LeaveSchema);
const Holiday = mongoose.models.Holiday || mongoose.model('Holiday', HolidaySchema);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findOne({ name: /Vikram Rao/i });
    if (!user) return console.log('User not found');

    const checkMonth = (month, year) => {
      const daysInMonth = new Date(year, month, 0).getDate();
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month - 1, daysInMonth);
      return { daysInMonth, startDate, endDate };
    };

    const analyzeMonth = async (month, year) => {
      const { daysInMonth, startDate, endDate } = checkMonth(month, year);
      const [att, lvs, hols] = await Promise.all([
        Attendance.find({ userId: user._id, date: { $gte: startDate, $lte: endDate } }),
        Leave.find({ userId: user._id, status: 'Approved', startDate: { $lte: endDate }, endDate: { $gte: startDate } }),
        Holiday.find({ date: { $gte: startDate, $lte: endDate } })
      ]);

      let lopCount = 0;
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month - 1, d);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        if (hols.some(h => h.date.toDateString() === date.toDateString())) continue;
        if (att.some(a => a.date.toDateString() === date.toDateString())) continue;
        if (lvs.some(l => date >= l.startDate && date <= l.endDate)) continue;
        lopCount++;
      }
      return lopCount;
    };

    const marchLOP = await analyzeMonth(3, 2026);
    const febLOP = await analyzeMonth(2, 2026);
    
    console.log(`--- Vikram Rao Check ---`);
    console.log(`March 2026 LOP: ${marchLOP}`);
    console.log(`February 2026 LOP: ${febLOP}`);
    
    const totalWorkingDaysMarch = 22; // Quick check
    console.log(`Working days in March 2026: ${totalWorkingDaysMarch}`);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

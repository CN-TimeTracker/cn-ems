const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const User = mongoose.model('User', new mongoose.Schema({ name: String }));
    const user = await User.findOne({ name: /Vikram Rao/i });
    
    if (!user) {
      console.log('User Vikram Rao not found');
      return;
    }

    console.log('User ID:', user._id);

    const Attendance = mongoose.model('Attendance', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, date: Date }));
    const Leave = mongoose.model('Leave', new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, status: String, startDate: Date, endDate: Date }));
    const Holiday = mongoose.model('Holiday', new mongoose.Schema({ date: Date }));

    // Let's check March 2026 (assuming that's the month)
    const year = 2026;
    const month = 3; // March
    const daysInMonth = new Date(year, month, 0).getDate();
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month - 1, daysInMonth);

    const [attendance, leaves, holidays] = await Promise.all([
      Attendance.find({ userId: user._id, date: { $gte: startDate, $lte: endDate } }),
      Leave.find({ userId: user._id, status: 'Approved', startDate: { $lte: endDate }, endDate: { $gte: startDate } }),
      Holiday.find({ date: { $gte: startDate, $lte: endDate } })
    ]);

    console.log('Total Attendance records for March:', attendance.length);
    console.log('Total Approved Leaves overlapping March:', leaves.length);
    console.log('Total Holidays in March:', holidays.length);

    let lopDays = 0;
    const lopDates = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month - 1, d);
      const dayOfWeek = dayDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isWeekend) continue;

      const isHoliday = holidays.some(h => h.date.toISOString().split('T')[0] === dayDate.toISOString().split('T')[0]);
      if (isHoliday) continue;

      const hasAttendance = attendance.some(a => a.date.toISOString().split('T')[0] === dayDate.toISOString().split('T')[0]);
      if (hasAttendance) continue;

      const isOnLeave = leaves.some(l => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        return dayDate >= start && dayDate <= end;
      });
      if (isOnLeave) continue;

      lopDays++;
      lopDates.push(dayDate.toISOString().split('T')[0]);
    }

    console.log('Calculated LOP Days for March:', lopDays);
    console.log('Dates marked as LOP:', lopDates);

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();

document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("currentStudent")) || {};
  const successBox = document.getElementById("successMessage");

  if (!data.name) {
    successBox.innerHTML = "<p>حدث خطأ في تحميل البيانات.</p>";
    return;
  }

  // نفس الكود المستخدم في showFinalMessage:
  const firstName = data.name.split(" ")[0];
  let message = `<p>تم تسجيل البيانات بنجاح يا ${firstName}</p>`;

  if (data.subscriptionType === "telegram") {
    message += `
      <p>لتأكيد انضمامك لقناة التليجرام يجب سداد مبلغ <strong>٢٠٠ جنيه</strong> في السنتر أو تحويل فودافون كاش على الرقم <strong>01096672229</strong>.</p>
      <p>وهذا المبلغ يسمح لك بالتواجد طول الترم على جروب التليجرام لمشاهدة جميع الحصص.</p>
      <p>للاستعلام تواصل مع المستر على <strong>01208320446</strong>.</p>
    `;
  } else if (data.subscriptionType === "center") {
    const appointment = `<p>إن شاء الله معادك ${data.days} الساعة ${data.time}</p>`;
    const startDay = getStartDay(data.grade, data.days);
    message += `${appointment}<p>والبداية ${startDay}</p>`;

    const fees = getFees(data.grade);
    let finalFee = fees.amount;
    let note = "";

    if (data.siblings === "ليا إخوات") {
      finalFee /= 2;
      note = `<p>نظرًا لأن ليك إخوات عندي في صفوف دراسية أخرى، سيتم خصم 50%، لتصبح المصاريف بعد الخصم <strong>${finalFee} جنيه</strong>.</p>`;
    }

    if (data.hafiz) {
      finalFee = fees.amount / 2;
      note = `<p>نظرًا لأنك حافظ للقرآن، سيتم خصم 50%، لتصبح المصاريف بعد الخصم <strong>${finalFee} جنيه</strong>.</p>`;
    }

    if (data.hafiz && data.siblings === "ليا إخوات") {
      finalFee = fees.amount / 2;
      note = `<p>نظرًا لأنك حافظ للقرآن وليك إخوات، سيتم خصم 50%  ، والمصاريف بعد الخصم هي <strong>${finalFee} جنيه</strong>.</p>`;
    }

    if (data.fatherDeceased) {
      note = `<p>نظرًا لوفاة والدك -رحمه الله-، فأنت <strong>معفي تمامًا</strong> من المصاريف الشهرية.</p>`;
    }

    message += `
      <p>${fees.desc}</p>
      ${note}
      <p>يرجى التأكد من تواجدك على جروب الواتساب لمتابعة كل جديد، وجروب التليجرام لمشاهدة الحصص.</p>
      ${getLinks(data.grade, data.gender)}
      <p>إن شاء الله عام سعيد ومختلف ومن تفوق لتفوق 🎯</p>
      <p>وهنشتغل من مذكرة خاصة هتكون في مكتبة أبو عبد الرحمن.</p>
    `;
  }

  successBox.innerHTML = message;

  // توابع المساعدة:
  function getStartDay(grade, days) {
    const lower = days.toLowerCase();
    if (grade === "3اعدادي") return "يوم الإثنين الموافق 16 / 8";
    if (lower.includes("سبت")) return "يوم السبت الموافق 14 / 8";
    if (lower.includes("حد")) return "يوم الأحد الموافق 15 / 8";
    if (lower.includes("اتنين")) return "يوم الإثنين الموافق 16 / 8";
    return "بداية قريبة - سيتم إعلامك بالتفاصيل";
  }

  function getFees(grade) {
    switch (grade) {
      case "1اعدادي": return { amount: 100, desc: "المصاريف الشهرية 100 جنيه، بداية كل شهر، تشمل 8 حصص." };
      case "2اعدادي": return { amount: 100, desc: "المصاريف الشهرية 100 جنيه، بداية كل شهر، تشمل 8 حصص." };
      case "3اعدادي": return { amount: 150, desc: "المصاريف الشهرية 150 جنيه، بداية كل شهر، تشمل 12 حصة." };
      case "1ثانوي": return { amount: 120, desc: "المصاريف الشهرية 120 جنيه، بداية كل شهر، تشمل 8 حصص." };
      case "2ثانوي": return { amount: 180, desc: "المصاريف الشهرية 180 جنيه، بداية كل شهر، تشمل 12 حصة." };
      default: return { amount: 0, desc: "لم يتم تحديد المصاريف." };
    }
  }

  function getLinks(grade, gender) {
    const links = {
      "1اعدادي": {
        ولد: {
          telegram: "https://t.me/+0dxFI0jZ8MY3ODQ0",
          whatsapp: "https://chat.whatsapp.com/HORKrwvu26X8QJoYWIJ5kE?mode=ac_c"
        },
        بنت: {
          telegram: "https://t.me/+7WpJux9lSZM2OTM0",
          whatsapp: "https://chat.whatsapp.com/J8U3zcvcm8HFemRD2J8dKp?mode=ac_c"
        }
      },
      "2اعدادي": {
        ولد: {
          telegram: "https://t.me/+fYCa0U9j8BdjMGM0",
          whatsapp: "https://chat.whatsapp.com/F2AUzXz2I3j2i25EYeHZet"
        },
        بنت: {
          telegram: "https://t.me/+akt7D3ZMewQ0Yjk0",
          whatsapp: "https://chat.whatsapp.com/KPyXA1lRrTC86PWFf108GN"
        }
      },
      "3اعدادي": {
        ولد: {
          telegram: "https://t.me/+kVB2VwkqdD9lMWJk",
          whatsapp: "https://chat.whatsapp.com/HvyZ90kTY9e33nNPixWu19"
        },
        بنت: {
          telegram: "https://t.me/+4rgsohKK_tEwYTk0",
          whatsapp: "https://chat.whatsapp.com/Jq7CatIc8OALG49bO00obt"
        }
      },
      "1ثانوي": {
        ولد: {
          telegram: "https://t.me/+0J2AXdqgNWc3YzQ0",
          whatsapp: "https://chat.whatsapp.com/L1U7EDIx3V3JEqBxrlyWKw"
        },
        بنت: {
          telegram: "https://t.me/+nIyj6VaZLkY1ZTg0",
          whatsapp: "https://chat.whatsapp.com/KTUVBAw34oeA9RCGr91Ra3?mode=ac_c"
        }
      },
      "2ثانوي": {
        ولد: {
          telegram: "https://t.me/+z8J1FX16QZc3MjQ0",
          whatsapp: "https://chat.whatsapp.com/DdvRtEm1IYJ5sdOW57SOxt"
        },
        بنت: {
          telegram: "https://t.me/+u8CZZtVbke81M2Zk",
          whatsapp: "https://chat.whatsapp.com/B6ZZXaToeS0CydSO22H9SE"
        }
      }
    };
    const set = links[grade]?.[gender];
    if (!set) return "";
    return `
      <div class="links">
        <a href="${set.telegram}" target="_blank" class="icon telegram">📲 جروب التليجرام</a>
        <a href="${set.whatsapp}" target="_blank" class="icon whatsapp">💬 جروب الواتساب</a>
      </div>
    `;
  }
});

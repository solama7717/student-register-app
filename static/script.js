window.onload = () => {
  updateFieldsVisibility();
  fillFormIfReturning();
  
  document.getElementById("subscriptionType").addEventListener("change", updateFieldsVisibility);
  document.getElementById("grade").addEventListener("change", updateScheduleOptions);
  document.getElementById("gender").addEventListener("change", updateScheduleOptions);

  document.getElementById("registrationForm").addEventListener("submit", handleFormSubmit);

  // ربط راديو الأخوات بإظهار خاناتهم
  const siblingsRadios = document.querySelectorAll('input[name="siblings"]');
  siblingsRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      const details = document.getElementById("siblingDetails");
      if (radio.value === "ليا إخوات" && radio.checked) {
        details.style.display = "block";
      } else {
        details.style.display = "none";
      }
    });
  });
};

function fillFormIfReturning() {
  const isEdit = localStorage.getItem("editMode") === "true";
  if (!isEdit) return;

  const data = JSON.parse(localStorage.getItem("currentStudent"));
  if (!data) return;

  document.getElementById("studentName").value = data.name || "";
  document.getElementById("studentPhone").value = data.studentPhone || "";
  document.getElementById("guardianPhone").value = data.guardianPhone || "";
  document.getElementById("whatsappPhone").value = data.whatsappPhone || "";
  document.getElementById("subscriptionType").value = data.subscriptionType || "";

  updateFieldsVisibility();

  setTimeout(() => {
    if (data.gender) document.getElementById("gender").value = data.gender;
    if (data.grade) document.getElementById("grade").value = data.grade;

    updateScheduleOptions();

    if (data.days) document.getElementById("days").value = data.days;
    if (data.time) {
      const timeOptions = document.getElementById("timeOptions");
      timeOptions.value = data.time;
      timeOptions.style.display = "block";
      document.getElementById("timeLabel").style.display = "block";
    }

    if (data.siblings === "ليا إخوات") {
      document.querySelector('input[name="siblings"][value="ليا إخوات"]').checked = true;
      document.getElementById("siblingDetails").style.display = "block";
      document.getElementById("siblingName").value = data.siblingName || "";
      document.getElementById("siblingGrade").value = data.siblingGrade || "";
    } else if (data.siblings === "مليش إخوات") {
      document.querySelector('input[name="siblings"][value="مليش إخوات"]').checked = true;
      document.getElementById("siblingDetails").style.display = "none";
    }

    document.getElementById("hafiz").checked = data.hafiz || false;
    document.getElementById("fatherDeceased").checked = data.fatherDeceased || false;
  }, 200);

  localStorage.removeItem("editMode");
}

const badWords = ["كسمك","غبي", "قذر", "احمق", "سخيف", "تافه","علق","خول","العرص","المتناكه",
  "متناك","متناكة","عرص","معرص","يابن","يا ابن","وسخه","أمك","امك"];
function containsBadWords(text) {
  return badWords.some(word => text.includes(word));
}

function updateFieldsVisibility() {
  const subscriptionType = document.getElementById("subscriptionType").value;
  const conditionalFields = document.getElementById("conditionalFields");

  if (subscriptionType === "center") {
    // إظهار كل الحقول الخاصة بالحضور في السنتر
    conditionalFields.style.display = "block";
    document.getElementById("grade").parentElement.style.display = "block";
    document.getElementById("gender").parentElement.style.display = "block";
    document.getElementById("timeLabel").style.display = "block";
    document.getElementById("timeOptions").style.display = "block";
    document.querySelector(".radio-group").style.display = "block";
    document.querySelector(".checkbox-group").style.display = "block";
  } else if (subscriptionType === "telegram") {
    // إظهار الصف والنوع فقط
    conditionalFields.style.display = "block";
    document.getElementById("grade").parentElement.style.display = "block";
    document.getElementById("gender").parentElement.style.display = "block";

    // إخفاء باقي الحقول
    document.getElementById("timeLabel").style.display = "none";
    document.getElementById("timeOptions").style.display = "none";
    document.getElementById("days").value = "";
    document.querySelector(".radio-group").style.display = "none";
    document.querySelector(".checkbox-group").style.display = "none";
    document.getElementById("siblingDetails").style.display = "none";
  } else {
    // إخفاء كل شيء في حالة عدم اختيار الاشتراك
    conditionalFields.style.display = "none";
  }
}


function updateScheduleOptions() {
  const subscriptionType = document.getElementById("subscriptionType").value;
  if (subscriptionType !== "center") {
  document.getElementById("days").value = "";
  document.getElementById("timeOptions").innerHTML = "";
  document.getElementById("timeOptions").style.display = "none";
  document.getElementById("timeLabel").style.display = "none";
  return;
}
;  // ✅ لا تعرض المواعيد إلا لو الاشتراك "center"

  const grade = document.getElementById("grade").value;
  const gender = document.querySelector('select#gender').value;
  const daysField = document.getElementById("days");
  const timeLabel = document.getElementById("timeLabel");
  const timeOptions = document.getElementById("timeOptions");

  if (!grade || !gender) return;

  const isBoy = gender === "ولد";

  const schedule = {
    "1اعدادي": isBoy
      ? { days: "الأحد - الأربعاء", times: ["7 م", "8 م"] }
      : { days: "الأحد - الأربعاء", times: ["4 م", "5 م", "6 م"] },

    "2اعدادي": isBoy
      ? { days: "الأحد - الثلاثاء", times: ["9.5 ص", "10.5 ص"] }
      : { days: "السبت - الثلاثاء", times: ["4 م", "5 م", "6 م"] },

    "3اعدادي": isBoy
      ? { days: "السبت 8.5 ص -الاتنين -الخميس", times: ["10 ص", "11 ص"] }
      : { days: "السبت 10 ص و 11.5 ص يحدد لاحقا - الاثنين - الخميس", times: ["4 م", "5 م", "6 م"] },

    "1ثانوي": isBoy
      ? { days: "الاثنين - الخميس", times: ["8 م"] }
      : { days: "الاثنين - الخميس", times: ["3 م", "7 م"] },

    "2ثانوي": isBoy
      ? { days: "السبت - الثلاثاء", times: ["8 م"] }
      : { days: "السبت - الثلاثاء", times: ["7 م"] },
  };

  const selected = schedule[grade];
  if (!selected) return;

  daysField.value = selected.days;

  timeOptions.innerHTML = selected.times.map(t => `<option value="${t}">${t}</option>`).join("");
  timeOptions.style.display = "block";
  timeLabel.style.display = "block";
}


function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("studentName").value.trim();
  const studentPhone = document.getElementById("studentPhone").value.trim();
  const guardianPhone = document.getElementById("guardianPhone").value.trim();
  const whatsappPhone = document.getElementById("whatsappPhone").value.trim();
  const subscriptionType = document.getElementById("subscriptionType").value;
  const gender = document.getElementById("gender").value;
  const grade = document.getElementById("grade").value;
  const warning = document.getElementById("warning");

  warning.style.display = "none";

  if (containsBadWords(name)) {
    warning.textContent = "يرجى عدم استخدام ألفاظ غير لائقة.";
    warning.style.display = "block";
    return;
  }

  if (!grade || !gender) {
    warning.textContent = "يرجى تحديد الصف والنوع.";
    warning.style.display = "block";
    return;
  }

  const savedRecords = JSON.parse(localStorage.getItem("students") || "[]");
  fetch("https://student-register-app-2d09.onrender.com//check_name", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name, guardianPhone })
})
.then(res => res.json())
.then(response => {
  if (response.exists) {
    warning.textContent = "هذا الاسم مسجل من قبل.";
    warning.style.display = "block";
    return;
  }

  // استكمال التسجيل هنا بعد التأكد إن الاسم مش مكرر
  proceedWithSubmission(data, savedRecords);
;  // ← ننقل باقي الكود هنا في دالة مستقلة
})
.catch(err => {
  console.error("خطأ في التحقق من الاسم:", err);
  warning.textContent = "⚠️ حدث خطأ أثناء التحقق من الاسم. حاول مرة أخرى.";
  warning.style.display = "block";
});


  const samePhoneCount = savedRecords.filter(entry => entry.guardianPhone === guardianPhone).length;
  if (samePhoneCount >= 3) {
    warning.textContent = "تم استخدام هذا الرقم أكثر من 3 مرات. لا يمكنك التسجيل.";
    warning.style.display = "block";
    return;
  }

  const data = { name, studentPhone, guardianPhone, whatsappPhone, subscriptionType, gender, grade, days: "", time: "", siblings: "", hafiz: false, fatherDeceased: false };

  if (subscriptionType === "center") {
    const selectedTime = document.getElementById("timeOptions").value;
    if (!selectedTime) {
      warning.textContent = "يرجى اختيار موعد.";
      warning.style.display = "block";
      return;
    }

    const selectedDay = document.getElementById("days").value;
    const isExempted = (grade === "2ثانوي") || (grade === "1ثانوي" && gender === "ولد");

    fetch("https://student-register-app-2d09.onrender.com//count_students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grade, gender, days: selectedDay, time: selectedTime })
    })
    .then(res => res.json())
    .then(result => {
      const count = result.count || 0;
      if (!isExempted) {
        if (count >= 40) {
          warning.textContent = "❌ هذا الموعد ممتلئ تمامًا. يرجى اختيار موعد آخر.";
          warning.style.display = "block";
          return;
        }
        if (count >= 30) alert("⚠️ هذا الموعد اقترب من الامتلاء (30 من 40). يُفضل اختيار موعد آخر.");
      }
      data.days = selectedDay;
      data.time = selectedTime;
      data.siblings = document.querySelector('input[name="siblings"]:checked')?.value || "غير محدد";
      if (data.siblings === "ليا إخوات") { data.siblingName = document.getElementById("siblingName").value.trim() || ""; data.siblingGrade = document.getElementById("siblingGrade").value || ""; }
      data.hafiz = document.getElementById("hafiz").checked;
      data.fatherDeceased = document.getElementById("fatherDeceased").checked;

      const submitBtn = document.getElementById("submitBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "جارٍ الحفظ...";

      setTimeout(() => window.location.href = "confirm.html", 1500);
    })
    .catch(err => { warning.textContent = "⚠️ حدث خطأ أثناء التحقق من عدد المسجلين."; warning.style.display = "block"; console.error(err); });

    return;
  }

  localStorage.setItem("currentStudent", JSON.stringify(data));
  localStorage.setItem("students", JSON.stringify([...savedRecords, data]));

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "جارٍ الحفظ...";
  setTimeout(() => window.location.href = "confirm.html", 1500);
}
function proceedWithSubmission(data, savedRecords) {
  localStorage.setItem("students", JSON.stringify([...savedRecords, data]));
  localStorage.setItem("currentStudent", JSON.stringify(data));

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.textContent = "جارٍ الحفظ...";

  setTimeout(() => {
    window.location.href = "confirm.html";
  }, 1500);
}

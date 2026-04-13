function doPost(e) {
  var sheet = SpreadsheetApp.openById("14po53ZFMgpGksL3IAXYOiULB42GXvK4RCr8NGH1oRn4")
    .getActiveSheet();

  var data = JSON.parse(e.postData.contents || "{}");
  var nameOrCompany = (data.nameOrCompany || "").trim();
  var email = (data.email || "").trim();
  var phone = (data.phone || "").trim();

  if (!nameOrCompany || (!email && !phone)) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        message: "Validation failed"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([
    new Date(),
    nameOrCompany,
    email,
    phone
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      message: "Saved successfully"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

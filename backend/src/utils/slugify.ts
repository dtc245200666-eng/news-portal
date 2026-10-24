export function slugifyVietnamese(text: string): string {
  let str = text.toLowerCase();

  // Normalize accented characters
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');

  // Some special characters
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Combining accent marks
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // â, ê, ô, ơ, ư

  // Remove invalid chars
  str = str.replace(/[^a-z0-9 -]/g, '');

  // Collapse whitespace and replace by -
  str = str.replace(/\s+/g, '-');

  // Collapse dashes
  str = str.replace(/-+/g, '-');

  // Trim dashes
  str = str.replace(/^-+|-+$/g, '');

  return str;
}

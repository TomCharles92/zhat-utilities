import axios from "axios";

/**
 * 这里可能有个前提，所以参数都是字符串类型（待求证）
 * 下载文件：通过 Form 表单下载文件，后台返回文件流（貌似必须用 get 方法，待求证）
 * 如此，也许可以将参数缀在url后面
 * url: String
 * params: Object
 * 
 * form => input => value 不支持对象，需要转成 json 来处理
 */
function zhat_fileDownload({ url, params, method = "get" }) {
  let form = document.createElement("form");
  form.style.display = "none";
  form.method = method;
  form.action = url;
  // 将参数放入表单元素中
  if (params) {
    for (let item in params) {
      let opt = document.createElement("textarea");
      opt.name = item;
      // input 的 value 不支持 Object，遇到转成 json
      if (params[item] instanceof Object) {
        opt.value = JSON.stringify(params[item]);
      } else {
        opt.value = params[item];
      }
      form.appendChild(opt);
    }
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

// 通过Blob的方式下载文件，方便添加headers
function zhat_fileDownloadByBlob({ url, params, method = "post", headers = {}, applicationType = "application/vnd.ms-excel" }) {
  let preConfig = {
    method: method,
    url: url,
    // 表明返回服务器返回的数据类型
    responseType: "blob",
    headers: headers
  }
  // method类型不同，参数类型也不同
  let config = {};
  if (method === "post") {
    config = Object.assign(preConfig, { data: params });
  } else if (method === "get") {
    config = Object.assign(preConfig, { params: params })
  }
  axios(config).then(res => {
    // 这里 content-disposition 的值是：attachment; filename="assetModel.xlsx"
    // 从中取出 filename，最终的文件名要与这个名字保持一致
    let disposition = res.headers["content-disposition"];
    let fileName = disposition.slice(disposition.indexOf("=") + 1);

    let blob = res.data.slice(0, res.data.size, applicationType);
    downloadOnA(blob, decodeURI(fileName))
  });
}

// 创建一个a标签，给它附上url，然后模拟下载
function downloadOnA(blob, fileName) {
  // IE浏览器
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, fileName);
  } else {
    const a = document.createElement("a");
    // 指定文件名
    a.download = fileName;
    a.style.display = "none";
    // 创建一个新的URL 对象，表示指定的 File 对象或 Blob 对象
    a.href = URL.createObjectURL(blob);
    document.body.appendChild(a);
    a.click();
    // 释放URL 对象
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  }
}

export { zhat_fileDownload, zhat_fileDownloadByBlob }
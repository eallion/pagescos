export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);

    // 根目录处理
    if (pathname === "/") {
      return new Response("Welcome to COS image proxy.", { status: 404 });
    }

    // 代理所有请求到 COS
    const bucketUrl = env.BUCKET_URL;
    const cosUrl = `https://${bucketUrl}${pathname}`;

    // 获取 COS 授权信息
    const authToken = getCosAuthorization(env.COS_SECRET_ID, env.COS_SECRET_KEY, request.method, pathname);

    // 发起请求到 COS
    const cosResponse = await fetch(cosUrl, {
      method: request.method,
      headers: {
        ...request.headers,
        Host: bucketUrl,
        authorization: authToken,
      },
    });

    // 处理 404 响应
    if (cosResponse.status === 404) {
      return new Response("Welcome to COS proxy, your visit URL is not exist.", { status: 404 });
    }

    // 返回 COS 响应
    const response = new Response(cosResponse.body, cosResponse);
    response.headers.set("Content-Disposition", "inline");
    return response;
  },
};

// 模拟 COS 授权逻辑
function getCosAuthorization(COS_SECRET_ID, COS_SECRET_KEY, method, objectKey) {
  // 这里你需要实现 COS 的授权逻辑
  // 返回一个授权字符串
  return "your-cos-authorization-token";
}
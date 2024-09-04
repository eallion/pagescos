export default {
	async fetch(request, env, ctx) {
		const { pathname, searchParams } = new URL(request.url);

		// 处理 robots.txt
		if (pathname === "/robots.txt") {
			return new Response("User-agent: *\nDisallow: /", {
				status: 200,
				headers: {
					"Content-Type": "text/plain",
				},
			});
		}

		// 根目录处理
		if (pathname === "/") {
			return new Response(
				"{\"status\":\"200\", \"message\":\"success\"}",
				{
					status: 200,
					headers: {
						"Content-Type": "application/json;charset=UTF-8"
					},
				}
			);
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
			return new Response(
				"{\"status\":\"404\", \"code\":\"NoSuchKey\", \"message\":\"The specified key does not exist.\"}",
				{
					status: 404,
					headers: {
						"Content-Type": "application/json;charset=UTF-8"
					},
				}
			);
		}

		// 返回 COS 响应
		const response = new Response(cosResponse.body, cosResponse);
		response.headers.set("Content-Disposition", "inline");
		response.headers.set("Cache-Control", "public, max-age=604800, must-revalidate");
		return response;
	},
};

// 模拟 COS 授权逻辑
function getCosAuthorization(COS_SECRET_ID, COS_SECRET_KEY, method, objectKey) {
	// 这里你需要实现 COS 的授权逻辑
	// 返回一个授权字符串
	return "your-cos-authorization-token";
}
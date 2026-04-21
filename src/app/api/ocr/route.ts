import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const base64Image = data.image

    if (!base64Image) {
      return NextResponse.json({ error: '没有提供图片数据' }, { status: 400 })
    }

    // 检查Base64大小（限制4MB）
    if (base64Image.length > 4 * 1024 * 1024) {
      return NextResponse.json({ error: '图片大小超过4MB限制' }, { status: 400 })
    }

    // 调用阿里云DashScope API
    const apiKey = 'sk-2a0a8af7014e429ebf6b5e0eb4eb12ff'
    const model = 'qwen-vl-plus'

    console.log('='.repeat(50))
    console.log('开始调用阿里云DashScope API')
    console.log('模型:', model)
    console.log('Base64长度:', base64Image.length)
    console.log('Base64前100字符:', base64Image.substring(0, 100))
    console.log('='.repeat(50))

    // 构建请求体（使用正确的messages格式）
    const requestBody = {
      model: model,
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                image: base64Image
              },
              {
                text: '请识别这张中医处方中的信息，严格按照以下格式返回：\n\n【病人信息】\n姓名：XX\n年龄：XX\n性别：XX\n\n【中药材】\n名称：XX\n剂量：XX\n\n名称：XX\n剂量：XX\n\n【用法用量】\n请提取药方中的用法用量信息\n\n请确保识别准确，不要添加任何额外说明或解释。'
              }
            ]
          }
        ]
      },
      parameters: {
        use_raw_prompt: true
      }
    }

    console.log('请求体预览:', JSON.stringify(requestBody).substring(0, 500) + '...')

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('API响应状态:', response.status)
    console.log('API响应头:', JSON.stringify(Object.fromEntries(response.headers)))

    // 获取原始响应文本
    const responseText = await response.text()
    console.log('='.repeat(50))
    console.log('阿里云原始响应:')
    console.log(responseText)
    console.log('='.repeat(50))

    if (!response.ok) {
      return NextResponse.json({
        error: 'API调用失败',
        status: response.status,
        details: responseText
      }, { status: response.status })
    }

    // 解析响应数据
    const responseData = JSON.parse(responseText)
    
    // 提取识别结果文本 - 正确的路径
    let generatedText = ''
    if (responseData.output?.choices?.[0]?.message?.content?.[0]?.text) {
      generatedText = responseData.output.choices[0].message.content[0].text
    }

    console.log('生成的文本:', generatedText)

    return NextResponse.json({
      success: true,
      ocrResult: generatedText,
      rawResponse: responseData
    })

  } catch (error) {
    console.error('='.repeat(50))
    console.error('OCR识别过程出错:')
    console.error(error)
    console.error('='.repeat(50))
    return NextResponse.json({
      error: 'OCR识别失败',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Response as Res, survey } from './survey';

// 创建 express 应用
const app = express();
// 解析请求体
app.use(bodyParser.json());

/**
 * @api {post} /survey 提交问卷调查数据
 * @apiName PostSurvey
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.1.1
 */
app.post('/survey', async(req: Request, res: Response<Res>) => {
    const { name, age, gender, surveyResult } = req.body;
    if (!name || !age || !gender || !surveyResult) {
        // 如果请求参数不完整，则返回错误信息
        console.log('请求参数缺失');
        return res.status(400).json({ code: 400, message: '缺少参数', data: null });
    }
    const data = await survey.save({ name, age, gender, surveyResult }); // 保存数据
    console.log(`提交问卷调查数据成功，数据为 ${JSON.stringify(data, null, 4)}`); // 控制台输出提示信息
    res.json(data);
});

/**
 * @api {get} /survey 查询所有问卷调查数据的接口
 * @apiName GetSurvey
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.1.0
 */
app.get('/survey', async(_req: Request, res: Response<Res>) => {
    const data = await survey.list(); // 查询数据
    console.log(`查询到 ${data.data.length} 条问卷调查数据`); // 控制台输出提示信息
    res.json(data);
});

/**
 * @api {get} /survey/:id 根据 ID 查询问卷调查数据的接口
 * @apiName GetSurveyById
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.1.0
 */
app.get('/survey/question/:id', async(req: Request, res: Response<Res>) => {
    const data = await survey.findById(req.params.id); // 根据 ID 查询数据
    console.log(`查询问卷调查数据，id 为 ${req.params.id}`); // 控制台输出提示信息
    res.status(data.code).json(data);
});

/**
 * @api {post} /survey/questions 设置调查问卷问题
 * @apiName SetQuestions
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.2.0
 * @example {
 *    "questions": [
 *    "你喜欢的水果是什么？",
 *    "你喜欢的动物是什么？",
 *    "你喜欢的颜色是什么？"
 *    ]
 *    }
 */
app.post('/survey/questions', async(req: Request, res: Response<Res>) => {
    const { questions } = req.body;
    const result = await survey.setQuestions(questions);
    res.json(result);
});

/**
 * @api {get} /survey/questions 获取调查问卷问题列表
 * @apiName GetQuestions
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.2.0
 */
app.get('/survey/questions', async(req: Request, res: Response<Res<string[]>>) => {
    const result = await survey.getQuestions();
    res.json(result);
});

/**
 * @api {put} /survey/questions 更新调查问卷问题列表
 * @apiName UpdateQuestions
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.2.0
 */
app.put('/survey/questions', async(req: Request, res: Response<Res<string>>) => {
    const { questions } = req.body;
    const result = await survey.updateQuestions(questions);
    res.json(result);
});

/**
 * @api {post} /survey/authorization 设置用户角色
 * @apiName SetAuthorization
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.3.0
 */
app.post('/survey/authorization', async(req: Request, res: Response<Res<string>>) => {
    const { userId, role } = req.body;
    const result = await survey.authorization.setRole(userId, role);
    res.json(result);
});

/**
 * @api {get} /survey/authorization 获取用户角色
 * @apiName GetAuthorization
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.3.0
 */
app.get('/survey/authorization/:userId', async(req: Request, res: Response<Res<string>>) => {
    const { userId } = req.params;
    const result = await survey.authorization.getRole(userId);
    res.json(result);
});

/**
 * @api {get} /survey/data/:surveyId 查询指定调查问卷的所有数据
 * @apiName QuerySurveyData
 * @apiGroup Survey 问卷调查
 * @apiVersion 0.3.0
 */
app.get('/survey/data/:surveyId', async(req: Request, res: Response<Res<any[]>>) => {
    const { surveyId } = req.params;
    const result = await survey.querySurveyData(surveyId);
    res.json(result);
});

export default app;

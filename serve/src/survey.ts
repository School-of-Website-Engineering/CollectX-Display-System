import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Store from './store';
import { Response } from './types';
import fs from 'fs/promises';

/**
 * 问卷调查数据结构
 * @interface SurveyData
 * @property {string} id 问卷调查数据 id
 * @property {string} name 姓名
 * @property {number} age 年龄
 * @property {number} gender 性别
 * @property {string} surveyResult 问卷调查结果
 * @property {number} createdAt 创建时间
 */
interface SurveyData {
    id: string;
    name: string;
    age: number;
    gender: string;
    surveyResult: string;
    createdAt: number;
}

/**
 * Survey 类
 * 问卷调查相关的数据操作
 */
class Survey {
    store: Store; // Store 类的实例
    authorization: Authorization; // Authorization 类的实例

    constructor() {
        this.store = new Store(path.resolve(__dirname, 'data/survey.json')); // 创建数据存储对象
        this.authorization = authorization; // 创建授权对象
    }

    /**
     * 保存问卷调查数据
     * @param data 问卷调查数据
     * @returns 保存成功的问卷调查数据
     */
    async save(data: Omit<SurveyData, 'id' | 'createdAt'>): Promise<Response<SurveyData>> {
        const newData: SurveyData = {
            ...data,
            id: uuidv4(),
            createdAt: Date.now(),
        }; // 生成新数据并保存
        await this.store.save(newData);
        console.log(`已将问卷调查数据 ${JSON.stringify(newData)} 保存至文件`); // 控制台输出提示信息
        return {
            code: 0,
            message: '提交成功',
            data: newData,
        };
    }

    /**
     * 查询所有问卷调查数据
     * @returns 问卷调查数据列表
     * @example await survey.list();
     * @example const { data } = await survey.list();
     */
    async list(): Promise<Response<SurveyData[]>> {
        const data = await this.store.read(); // 从数据存储对象中读取数据
        console.log(`查询到 ${data.length} 条问卷调查数据`); // 控制台输出提示信息
        return {
            code: 0,
            message: '查询成功',
            data: data.sort((a, b) => b.createdAt - a.createdAt), // 根据创建时间倒序排序
        };
    }

    /**
     * 根据 id 查询问卷调查数据
     * @param id 问卷调查数据 id
     * @returns 问卷调查数据
     * @example await survey.findById('xxx');
     */
    async findById(id: string): Promise<Response<SurveyData | undefined>> {
        const data = await this.store.read();
        const result = data.find((item) => item.id === id);
        if (result) {
            console.log(`查询问卷调查数据，id 为 ${id} 的数据存在`); // 控制台输出提示信息
            return {
                code: 0,
                message: '查询成功',
                data: result,
            };
        } else {
            console.log(`查询问卷调查数据，id 为 ${id} 的数据不存在`); // 控制台输出提示信息
            return {
                code: 404,
                message: '数据不存在',
                data: undefined,
            };
        }
    }

    /**
     * 设置调查问卷问题
     * @param questions 调查问卷问题
     * @param surveyName
     * @returns 返回成功信息
     * @example await survey.setQuestions(['问题1', '问题2'], 'survey1');
     */
    async setQuestions(questions: any[], surveyName: string): Promise<Response> {
        if (!questions || !Array.isArray(questions)) {
            return {
                code: 400,
                message: '参数错误',
                data: '请提供正确的问题列表',
            };
        }
        await this.store.saveQuestions(questions, surveyName);
        return {
            code: 0,
            message: '设置成功',
            data: '问题列表已更新！',
        };
    }

    /**
     * 查询调查问卷问题列表
     * @returns 返回问题列表
     */
    async getQuestions(): Promise<Response<string[]>> {
        const questions = await this.store.readQuestions();
        console.log(`查询到 ${questions.length} 条问题`);
        return {
            code: 0,
            message: '查询成功',
            data: questions,
        };
    }

    /**
     * 更新调查问卷问题列表
     * @param questions 问题列表
     * @param surveyName
     * @returns 返回更新成功信息
     */
    async updateQuestions(questions: string[], surveyName: string): Promise<Response> {
        return await this.store.saveQuestions(questions, surveyName);
    }

    /**
     * 查询调查问卷数据列表
     * @param surveyName 调查问卷名称
     * @returns 返回数据列表
     */
    async querySurveyData(surveyName: string): Promise<Response<any[]>> {
        const data = await this.store.querySurveyData(surveyName);
        console.log(`查询${surveyName}调查问卷数据，共${data.length}条`);
        if (data.length === 0) {
            return {
                code: 404,
                message: '数据不存在',
                data: [],
            };
        }
        return {
            code: 0,
            message: '查询成功',
            data,
        };
    }
}

/**
 * 权限控制类
 * 用于区分用户角色
 */
class Authorization {
    authorizationMap: { [key: string]: string };

    constructor() {
        this.authorizationMap = {};
    }

    /**
     * 设置用户角色
     * @param userId 用户id
     * @param role 用户角色
     * @returns 返回成功信息
     */
    async setRole(userId: string, role: string): Promise<Response<string>> {
        if (!userId || !role) {
            return {
                code: 400,
                message: '缺少参数',
                data: '请提供正确的用户id和角色',
            };
        }
        this.authorizationMap[userId] = role;
        return {
            code: 0,
            message: '设置成功',
            data: '用户角色已更新！',
        };
    }

    /**
     * 查询用户角色
     * @param userId 用户id
     * @returns 返回角色信息
     */
    async getRole(userId: string): Promise<Response<string>> {
        if (!userId) {
            return {
                code: 400,
                message: '缺少参数',
                data: '请提供正确的用户id',
            };
        }
        const role = this.authorizationMap[userId] ?? '';
        return {
            code: 0,
            message: '查询成功',
            data: role,
        };
    }
}

export const survey = new Survey();
export const authorization = new Authorization();
export { Response };

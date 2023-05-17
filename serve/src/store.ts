import fs from 'fs/promises';
import path from 'path';
import { Response } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Store 类
 * 用于数据存储
 */
class Store {
    filePath: string;

    /**
     * 构造函数
     * @param filePath 文件路径
     */
    constructor(filePath: string) {
        this.filePath = filePath;
    }

    /**
     * 获取data目录下所有文件名
     * @returns 返回文件名列表
     */
    public async listFiles(): Promise<string[]> {
        const dataPath = path.resolve(__dirname, 'data');
        return await fs.readdir(dataPath);
    }

    /**
     * 保存数据到文件中
     * @param data 要保存的数据
     * @returns 返回保存后的数据
     * @example await store.save({ name: '张三', age: 18 });
     */
    public async save(data: any): Promise<any[]> {
        // 读取文件中已有的数据
        const fileData = await this.readFromFile();
        // 将新数据合并入已有数据，并写入文件
        const newData = [...fileData, data];
        // 格式化数据并写入文件
        await fs.writeFile(this.filePath, JSON.stringify(newData, null, 4));
        console.log(`已将数据保存至 ${this.filePath} 文件中`); // 控制台输出提示信息
        return newData;
    }

    /**
     * 从文件中读取数据
     * @returns 返回读取到的数据
     * @example await store.read();
     */
    public async read(): Promise<any[]> {
        const fileData = await this.readFromFile();
        console.log(`从 ${this.filePath} 文件中读取到数据`); // 控制台输出提示信息
        return fileData;
    }

    /**
     * 从文件中读取数据（内部方法）
     * @private
     * @returns 返回读取到的数据
     * @example await store.readFromFile();
     */
    private async readFromFile(): Promise<any[]> {
        try {
            const data = await fs.readFile(this.filePath);
            return JSON.parse(data.toString());
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                // 如果文件不存在，则返回空数组
                console.log(`文件 ${this.filePath} 不存在`);
                return [];
            }
            throw e;
        }
    }

    /**
     * 从文件中读取问题列表
     * @returns 返回读取到的问题列表
     */
    public async readQuestions(): Promise<string[]> {
        const questionFilePath = path.resolve(__dirname, 'data/question.json');
        try {
            const data = await fs.readFile(questionFilePath);
            return JSON.parse(data.toString());
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                // 如果文件不存在，则返回空数组
                console.log(`文件 ${questionFilePath} 不存在`);
                return [];
            }
            throw e;
        }
    }

    /**
     * 保存问题列表到文件中
     * @param questions 问题列表
     * @param surveyName
     * @returns 返回保存成功信息
     * @example await store.saveQuestions(['你喜欢吃苹果吗？', '你喜欢吃香蕉吗？'], 'fruit');
     */
    public async saveQuestions(questions: string[], surveyName: string): Promise<Response> {
        // 设置创建时间与id
        const newQuestion = {
            id: uuidv4(),
            createTime: new Date().toISOString(),
            questions,
        };
        const filePath = path.resolve(__dirname, `data/${surveyName}_question.json`);
        await fs.writeFile(filePath, JSON.stringify(newQuestion, null, 4));
        console.log(`已将${surveyName}的问题列表保存至 ${filePath} 文件中`); // 控制台输出提示信息

        // const questionFilePath = path.resolve(__dirname, `data/${surveyName}_question.json`);
        // await fs.writeFile(newQuestion, JSON.stringify(questions, null, 4));
        // console.log(`已将${surveyName}的问题列表保存至 ${newQuestion} 文件中`); // 控制台输出提示信息
        return {
            code: 0,
            message: '设置成功',
            data: '问题列表已更新！',
        };
    }

    /**
     * 根据文件名查询数据
     * @param fileName 文件名
     * @returns 返回查询到的数据
     */
    public async findByFileName(fileName: string): Promise<any | undefined> {
        const filePath = path.resolve(__dirname, `data/${fileName}.json`);
        try {
            const data = await fs.readFile(filePath);
            return JSON.parse(data.toString());
        } catch (e: any) {
            if (e.code === 'ENOENT') {
                // 如果文件不存在，则返回undefined
                console.log(`文件 ${filePath} 不存在`);
                return undefined;
            }
            throw e;
        }
    }

    /**
     * 查询指定调查问卷的所有数据
     * @param surveyName 调查问卷id
     * @returns 返回查询到的数据列表
     */
    public async querySurveyData(surveyName: string): Promise<any[]> {
        const files = await this.listFiles();
        const regex = new RegExp(`^${surveyName}_data_`);
        const dataFiles = files.filter((file) => regex.test(file));
        return Promise.all(
            dataFiles.map(async (file) => {
                const data = await this.findByFileName(file);
                return { ...data, id: file };
            }),
        );
    }
}

export default Store;
